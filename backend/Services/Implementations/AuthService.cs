using System.Security.Cryptography;
using Microsoft.EntityFrameworkCore;
using SoulmateStore.Data;
using SoulmateStore.DTOs.Auth;
using SoulmateStore.Exceptions;
using SoulmateStore.Helpers;
using SoulmateStore.Models;
using SoulmateStore.Models.Enums;
using SoulmateStore.Services.Interfaces;

namespace SoulmateStore.Services.Implementations;

public class AuthService : IAuthService
{
    private readonly AppDbContext _db;
    private readonly IJwtHelper _jwt;
    private readonly IEmailService _email;
    private readonly IConfiguration _config;
    private readonly ILogger<AuthService> _logger;

    public AuthService(
        AppDbContext db,
        IJwtHelper jwt,
        IEmailService email,
        IConfiguration config,
        ILogger<AuthService> logger)
    {
        _db = db;
        _jwt = jwt;
        _email = email;
        _config = config;
        _logger = logger;
    }

    public async Task<(AuthResponseDto Response, string RefreshToken)> RegisterAsync(RegisterDto dto, string lang = "ar")
    {
        var emailExists = await _db.Users.AnyAsync(u => u.Email == dto.Email);
        if (emailExists)
            throw new ConflictException("EMAIL_EXISTS", "الإيميل ده مسجل قبل كده");

        var user = new User
        {
            Name = Helpers.InputSanitizer.StripHtml(dto.Name),
            Email = dto.Email.ToLowerInvariant(),
            Phone = dto.Phone,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            Role = UserRole.Customer,
            PreferredLang = lang is "ar" or "en" ? lang : "ar",
            CreatedAt = DateTime.UtcNow
        };

        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        _logger.LogInformation("New user registered: {Email}", user.Email);

        var accessToken = _jwt.GenerateAccessToken(user.Id, user.Email, user.Role);
        var refreshToken = _jwt.GenerateRefreshToken();

        var refreshExpiry = DateTime.UtcNow.AddDays(
            int.Parse(_config["Jwt:RefreshTokenExpiresInDays"] ?? "7"));

        _db.RefreshTokens.Add(new RefreshToken
        {
            UserId = user.Id,
            Token = HashToken(refreshToken),
            ExpiresAt = refreshExpiry,
            CreatedAt = DateTime.UtcNow
        });

        await _db.SaveChangesAsync();

        var response = new AuthResponseDto
        {
            AccessToken = accessToken,
            User = MapToUserDto(user)
        };

        return (response, refreshToken);
    }

    public async Task<(AuthResponseDto Response, string RefreshToken)> LoginAsync(LoginDto dto, string lang = "ar")
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == dto.Email.ToLowerInvariant());
        if (user is null)
            throw new UnauthorizedException("INVALID_CREDENTIALS", "الإيميل أو كلمة المرور غلط");

        // Account lockout check
        if (user.LockoutEnd.HasValue && user.LockoutEnd > DateTime.UtcNow)
        {
            var remainingMinutes = (int)(user.LockoutEnd.Value - DateTime.UtcNow).TotalMinutes + 1;
            throw new UnauthorizedException("ACCOUNT_LOCKED",
                $"الحساب مقفول. جرب تاني بعد {remainingMinutes} دقيقة");
        }

        if (!BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
        {
            user.FailedLoginAttempts++;

            var maxAttempts = int.Parse(_config["Authentication:MaxFailedAttempts"] ?? "5");
            if (user.FailedLoginAttempts >= maxAttempts)
            {
                var lockoutMinutes = int.Parse(_config["Authentication:LockoutMinutes"] ?? "15");
                user.LockoutEnd = DateTime.UtcNow.AddMinutes(lockoutMinutes);
                _logger.LogWarning("Account locked after {MaxAttempts} failed attempts: {Email}", maxAttempts, user.Email);
            }

            await _db.SaveChangesAsync();
            throw new UnauthorizedException("INVALID_CREDENTIALS", "الإيميل أو كلمة المرور غلط");
        }

        user.FailedLoginAttempts = 0;
        user.LockoutEnd = null;

        // Sync preferred language from frontend
        if (lang is "ar" or "en")
            user.PreferredLang = lang;

        // Generate tokens
        var accessToken = _jwt.GenerateAccessToken(user.Id, user.Email, user.Role);
        var refreshToken = _jwt.GenerateRefreshToken();

        // Determine refresh token expiry based on role
        var refreshExpiry = user.Role == UserRole.Admin
            ? DateTime.UtcNow.AddHours(
                int.Parse(_config["Jwt:AdminRefreshTokenExpiresInHours"] ?? "24"))
            : DateTime.UtcNow.AddDays(
                int.Parse(_config["Jwt:RefreshTokenExpiresInDays"] ?? "7"));

        var hashedToken = HashToken(refreshToken);

        _db.RefreshTokens.Add(new RefreshToken
        {
            UserId = user.Id,
            Token = hashedToken,
            ExpiresAt = refreshExpiry,
            CreatedAt = DateTime.UtcNow
        });

        await _db.SaveChangesAsync();

        _logger.LogInformation("User logged in: {Email}", user.Email);

        var response = new AuthResponseDto
        {
            AccessToken = accessToken,
            User = MapToUserDto(user)
        };

        return (response, refreshToken);
    }

    public async Task<UserDto> GetMeAsync(Guid userId)
    {
        var user = await _db.Users.FindAsync(userId)
            ?? throw new NotFoundException("USER_NOT_FOUND", "المستخدم مش موجود");

        return MapToUserDto(user);
    }

    public async Task<(AuthResponseDto Response, string RefreshToken)> RefreshTokenAsync(string refreshToken)
    {
        var hashedToken = HashToken(refreshToken);

        var storedToken = await _db.RefreshTokens
            .Include(rt => rt.User)
            .FirstOrDefaultAsync(rt => rt.Token == hashedToken && !rt.IsRevoked);

        if (storedToken is null || storedToken.ExpiresAt < DateTime.UtcNow)
        {
            if (storedToken is not null)
            {
                storedToken.IsRevoked = true;
                storedToken.RevokedAt = DateTime.UtcNow;
                await _db.SaveChangesAsync();
            }
            throw new UnauthorizedException("INVALID_REFRESH_TOKEN", "الـ refresh token مش صالح");
        }

        // Revoke old token (rotation)
        storedToken.IsRevoked = true;
        storedToken.RevokedAt = DateTime.UtcNow;

        var user = storedToken.User;
        var newAccessToken = _jwt.GenerateAccessToken(user.Id, user.Email, user.Role);
        var newRefreshToken = _jwt.GenerateRefreshToken();

        var refreshExpiry = user.Role == UserRole.Admin
            ? DateTime.UtcNow.AddHours(
                int.Parse(_config["Jwt:AdminRefreshTokenExpiresInHours"] ?? "24"))
            : DateTime.UtcNow.AddDays(
                int.Parse(_config["Jwt:RefreshTokenExpiresInDays"] ?? "7"));

        _db.RefreshTokens.Add(new RefreshToken
        {
            UserId = user.Id,
            Token = HashToken(newRefreshToken),
            ExpiresAt = refreshExpiry,
            CreatedAt = DateTime.UtcNow
        });

        await _db.SaveChangesAsync();

        var response = new AuthResponseDto
        {
            AccessToken = newAccessToken,
            User = MapToUserDto(user)
        };

        return (response, newRefreshToken);
    }

    public async Task LogoutAsync(string refreshToken)
    {
        var hashedToken = HashToken(refreshToken);
        var storedToken = await _db.RefreshTokens
            .FirstOrDefaultAsync(rt => rt.Token == hashedToken && !rt.IsRevoked);

        if (storedToken is not null)
        {
            storedToken.IsRevoked = true;
            storedToken.RevokedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();
        }
    }

    public async Task ForgotPasswordAsync(ForgotPasswordDto dto)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == dto.Email.ToLowerInvariant());

        // Always return success to prevent email enumeration
        if (user is null)
            return;

        var resetToken = Convert.ToBase64String(RandomNumberGenerator.GetBytes(32));
        user.PasswordResetToken = HashToken(resetToken);
        user.PasswordResetTokenExpiry = DateTime.UtcNow.AddHours(1);

        // Use the language from the request, falling back to user's saved preference
        var lang = dto.Lang is "ar" or "en" ? dto.Lang : user.PreferredLang;

        await _db.SaveChangesAsync();

        var frontendUrl = _config["FrontendUrl"] ?? "http://localhost:4200";
        var resetLink = $"{frontendUrl}/reset-password?token={Uri.EscapeDataString(resetToken)}";

        await _email.SendPasswordResetAsync(user.Email, resetLink, lang);
        _logger.LogInformation("Password reset requested for: {Email}", user.Email);
    }

    public async Task ResetPasswordAsync(ResetPasswordDto dto)
    {
        var hashedToken = HashToken(dto.Token);
        var user = await _db.Users.FirstOrDefaultAsync(u =>
            u.PasswordResetToken == hashedToken &&
            u.PasswordResetTokenExpiry > DateTime.UtcNow);

        if (user is null)
            throw new UnauthorizedException("INVALID_RESET_TOKEN", "الرابط مش صالح أو انتهت صلاحيته");

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
        user.PasswordResetToken = null;
        user.PasswordResetTokenExpiry = null;
        user.FailedLoginAttempts = 0;
        user.LockoutEnd = null;

        // Revoke all refresh tokens (force re-login)
        var activeTokens = await _db.RefreshTokens
            .Where(rt => rt.UserId == user.Id && !rt.IsRevoked)
            .ToListAsync();

        foreach (var token in activeTokens)
        {
            token.IsRevoked = true;
            token.RevokedAt = DateTime.UtcNow;
        }

        await _db.SaveChangesAsync();
        _logger.LogInformation("Password reset completed for: {Email}", user.Email);
    }

    public async Task ChangePasswordAsync(Guid userId, ChangePasswordDto dto)
    {
        var user = await _db.Users.FindAsync(userId)
            ?? throw new NotFoundException("USER_NOT_FOUND", "المستخدم مش موجود");

        if (!BCrypt.Net.BCrypt.Verify(dto.CurrentPassword, user.PasswordHash))
            throw new UnauthorizedException("WRONG_PASSWORD", "كلمة المرور الحالية غلط");

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
        await _db.SaveChangesAsync();

        _logger.LogInformation("Password changed for: {Email}", user.Email);
    }

    public async Task<UserDto> UpdateProfileAsync(Guid userId, UpdateProfileDto dto)
    {
        var user = await _db.Users.FindAsync(userId)
            ?? throw new NotFoundException("USER_NOT_FOUND", "المستخدم مش موجود");

        user.Name = Helpers.InputSanitizer.StripHtml(dto.Name);
        user.Phone = dto.Phone;

        await _db.SaveChangesAsync();

        _logger.LogInformation("Profile updated for: {Email}", user.Email);
        return MapToUserDto(user);
    }

    public async Task UpdateLangAsync(Guid userId, string lang)
    {
        if (lang is not ("ar" or "en")) return;

        var user = await _db.Users.FindAsync(userId);
        if (user is null) return;

        user.PreferredLang = lang;
        await _db.SaveChangesAsync();
    }

    private static string HashToken(string token)
    {
        var bytes = SHA256.HashData(System.Text.Encoding.UTF8.GetBytes(token));
        return Convert.ToBase64String(bytes);
    }

    private static UserDto MapToUserDto(User user) => new()
    {
        Id = user.Id,
        Name = user.Name,
        Email = user.Email,
        Phone = user.Phone,
        Role = user.Role,
        CreatedAt = user.CreatedAt
    };
}
