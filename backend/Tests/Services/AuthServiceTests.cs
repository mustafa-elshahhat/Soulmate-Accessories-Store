using FluentAssertions;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Moq;
using SoulmateStore.Data;
using SoulmateStore.DTOs.Auth;
using SoulmateStore.Exceptions;
using SoulmateStore.Helpers;
using SoulmateStore.Models;
using SoulmateStore.Models.Enums;
using SoulmateStore.Services.Implementations;
using SoulmateStore.Services.Interfaces;
using SoulmateStore.Tests.Helpers;

namespace SoulmateStore.Tests.Services;

public class AuthServiceTests : IDisposable
{
    private readonly AppDbContext _db;
    private readonly JwtHelper _jwt;
    private readonly Mock<IEmailService> _mockEmail;
    private readonly AuthService _service;

    public AuthServiceTests()
    {
        _db = TestDbContextFactory.Create();

        var config = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["Jwt:Secret"] = "SuperSecretKeyThatIsAtLeast32CharactersLong!",
                ["Jwt:Issuer"] = "test-issuer",
                ["Jwt:Audience"] = "test-audience",
                ["Jwt:AccessTokenExpiresInMinutes"] = "15",
                ["Jwt:RefreshTokenExpiresInDays"] = "7",
                ["Jwt:AdminRefreshTokenExpiresInHours"] = "24",
                ["FrontendUrl"] = "http://localhost:4200"
            })
            .Build();

        _jwt = new JwtHelper(config);
        _mockEmail = new Mock<IEmailService>();
        var logger = new Mock<ILogger<AuthService>>();

        _service = new AuthService(_db, _jwt, _mockEmail.Object, config, logger.Object);
    }

    public void Dispose()
    {
        _db.Dispose();
        GC.SuppressFinalize(this);
    }

    // --- Register Tests ---

    [Fact]
    public async Task Register_WithValidData_ReturnsTokenAndUser()
    {
        var dto = new RegisterDto
        {
            Name = "Test User",
            Email = "test@example.com",
            Phone = "01012345678",
            Password = "password123"
        };

        var (response, refreshToken) = await _service.RegisterAsync(dto);

        response.Should().NotBeNull();
        response.AccessToken.Should().NotBeNullOrEmpty();
        response.User.Email.Should().Be("test@example.com");
        response.User.Name.Should().Be("Test User");
        refreshToken.Should().NotBeNullOrEmpty();
    }

    [Fact]
    public async Task Register_WithExistingEmail_ThrowsConflict()
    {
        _db.Users.Add(new User
        {
            Name = "Existing",
            Email = "test@example.com",
            Phone = "01012345678",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("password"),
            Role = UserRole.Customer,
            CreatedAt = DateTime.UtcNow
        });
        await _db.SaveChangesAsync();

        var dto = new RegisterDto
        {
            Name = "Test",
            Email = "test@example.com",
            Phone = "01099999999",
            Password = "password123"
        };

        var act = () => _service.RegisterAsync(dto);

        await act.Should().ThrowAsync<ConflictException>()
            .Where(e => e.ErrorCode == "EMAIL_EXISTS");
    }

    [Fact]
    public async Task Register_StoresHashedPassword_NotPlainText()
    {
        var dto = new RegisterDto
        {
            Name = "Test",
            Email = "hash@test.com",
            Phone = "01012345678",
            Password = "mypassword"
        };

        await _service.RegisterAsync(dto);

        var user = _db.Users.First(u => u.Email == "hash@test.com");
        user.PasswordHash.Should().NotBe("mypassword");
        BCrypt.Net.BCrypt.Verify("mypassword", user.PasswordHash).Should().BeTrue();
    }

    [Fact]
    public async Task Register_CreatesRefreshToken_InDatabase()
    {
        var dto = new RegisterDto
        {
            Name = "Test",
            Email = "refresh@test.com",
            Phone = "01012345678",
            Password = "password123"
        };

        await _service.RegisterAsync(dto);

        _db.RefreshTokens.Should().HaveCount(1);
        var token = _db.RefreshTokens.First();
        token.IsRevoked.Should().BeFalse();
        token.ExpiresAt.Should().BeAfter(DateTime.UtcNow);
    }

    // --- Login Tests ---

    [Fact]
    public async Task Login_WithValidCredentials_ReturnsToken()
    {
        _db.Users.Add(new User
        {
            Name = "Test",
            Email = "login@test.com",
            Phone = "01012345678",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("password123"),
            Role = UserRole.Customer,
            CreatedAt = DateTime.UtcNow
        });
        await _db.SaveChangesAsync();

        var dto = new LoginDto { Email = "login@test.com", Password = "password123" };

        var (response, refreshToken) = await _service.LoginAsync(dto);

        response.AccessToken.Should().NotBeNullOrEmpty();
        response.User.Email.Should().Be("login@test.com");
        refreshToken.Should().NotBeNullOrEmpty();
    }

    [Fact]
    public async Task Login_WithWrongPassword_ThrowsUnauthorized()
    {
        _db.Users.Add(new User
        {
            Name = "Test",
            Email = "wrong@test.com",
            Phone = "01012345678",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("correctpassword"),
            Role = UserRole.Customer,
            CreatedAt = DateTime.UtcNow
        });
        await _db.SaveChangesAsync();

        var dto = new LoginDto { Email = "wrong@test.com", Password = "wrongpassword" };

        var act = () => _service.LoginAsync(dto);

        await act.Should().ThrowAsync<UnauthorizedException>()
            .Where(e => e.ErrorCode == "INVALID_CREDENTIALS");
    }

    [Fact]
    public async Task Login_WithNonExistentEmail_ThrowsUnauthorized()
    {
        var dto = new LoginDto { Email = "nonexistent@test.com", Password = "password" };

        var act = () => _service.LoginAsync(dto);

        await act.Should().ThrowAsync<UnauthorizedException>()
            .Where(e => e.ErrorCode == "INVALID_CREDENTIALS");
    }

    [Fact]
    public async Task Login_IncrementsFailedAttempts_OnWrongPassword()
    {
        _db.Users.Add(new User
        {
            Name = "Test",
            Email = "attempts@test.com",
            Phone = "01012345678",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("correct"),
            Role = UserRole.Customer,
            CreatedAt = DateTime.UtcNow
        });
        await _db.SaveChangesAsync();

        var dto = new LoginDto { Email = "attempts@test.com", Password = "wrong" };

        try { await _service.LoginAsync(dto); } catch { }
        try { await _service.LoginAsync(dto); } catch { }

        var user = _db.Users.First(u => u.Email == "attempts@test.com");
        user.FailedLoginAttempts.Should().Be(2);
    }

    [Fact]
    public async Task Login_LocksAccount_After5FailedAttempts()
    {
        _db.Users.Add(new User
        {
            Name = "Test",
            Email = "lockout@test.com",
            Phone = "01012345678",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("correct"),
            Role = UserRole.Customer,
            FailedLoginAttempts = 4,
            CreatedAt = DateTime.UtcNow
        });
        await _db.SaveChangesAsync();

        var dto = new LoginDto { Email = "lockout@test.com", Password = "wrong" };
        try { await _service.LoginAsync(dto); } catch { }

        var user = _db.Users.First(u => u.Email == "lockout@test.com");
        user.LockoutEnd.Should().NotBeNull();
        user.LockoutEnd.Should().BeAfter(DateTime.UtcNow);
    }

    [Fact]
    public async Task Login_LockedAccount_ThrowsUnauthorized()
    {
        _db.Users.Add(new User
        {
            Name = "Test",
            Email = "locked@test.com",
            Phone = "01012345678",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("correct"),
            Role = UserRole.Customer,
            LockoutEnd = DateTime.UtcNow.AddMinutes(10),
            CreatedAt = DateTime.UtcNow
        });
        await _db.SaveChangesAsync();

        var dto = new LoginDto { Email = "locked@test.com", Password = "correct" };

        var act = () => _service.LoginAsync(dto);

        await act.Should().ThrowAsync<UnauthorizedException>()
            .Where(e => e.ErrorCode == "ACCOUNT_LOCKED");
    }

    [Fact]
    public async Task Login_SuccessfulLogin_ResetsFailedAttempts()
    {
        _db.Users.Add(new User
        {
            Name = "Test",
            Email = "reset@test.com",
            Phone = "01012345678",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("correct"),
            Role = UserRole.Customer,
            FailedLoginAttempts = 3,
            CreatedAt = DateTime.UtcNow
        });
        await _db.SaveChangesAsync();

        var dto = new LoginDto { Email = "reset@test.com", Password = "correct" };
        await _service.LoginAsync(dto);

        var user = _db.Users.First(u => u.Email == "reset@test.com");
        user.FailedLoginAttempts.Should().Be(0);
        user.LockoutEnd.Should().BeNull();
    }

    // --- GetMe Tests ---

    [Fact]
    public async Task GetMe_WithValidUserId_ReturnsUser()
    {
        var user = new User
        {
            Name = "Test",
            Email = "me@test.com",
            Phone = "01012345678",
            PasswordHash = "hash",
            Role = UserRole.Customer,
            CreatedAt = DateTime.UtcNow
        };
        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        var result = await _service.GetMeAsync(user.Id);

        result.Email.Should().Be("me@test.com");
        result.Name.Should().Be("Test");
    }

    [Fact]
    public async Task GetMe_WithInvalidUserId_ThrowsNotFound()
    {
        var act = () => _service.GetMeAsync(Guid.NewGuid());

        await act.Should().ThrowAsync<NotFoundException>()
            .Where(e => e.ErrorCode == "USER_NOT_FOUND");
    }

    // --- Logout Tests ---

    [Fact]
    public async Task Logout_RevokesRefreshToken()
    {
        var user = new User
        {
            Name = "Test",
            Email = "logout@test.com",
            Phone = "01012345678",
            PasswordHash = "hash",
            Role = UserRole.Customer,
            CreatedAt = DateTime.UtcNow
        };
        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        var (_, refreshToken) = await _service.RegisterAsync(new RegisterDto
        {
            Name = "Test2",
            Email = "logout2@test.com",
            Phone = "01012345679",
            Password = "password123"
        });

        await _service.LogoutAsync(refreshToken);

        _db.RefreshTokens.Where(rt => !rt.IsRevoked).Should().BeEmpty();
    }

    // --- ChangePassword Tests ---

    [Fact]
    public async Task ChangePassword_WithCorrectCurrent_UpdatesPassword()
    {
        var user = new User
        {
            Name = "Test",
            Email = "change@test.com",
            Phone = "01012345678",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("oldpassword"),
            Role = UserRole.Customer,
            CreatedAt = DateTime.UtcNow
        };
        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        var dto = new ChangePasswordDto { CurrentPassword = "oldpassword", NewPassword = "newpassword" };
        await _service.ChangePasswordAsync(user.Id, dto);

        var updated = _db.Users.First(u => u.Id == user.Id);
        BCrypt.Net.BCrypt.Verify("newpassword", updated.PasswordHash).Should().BeTrue();
    }

    [Fact]
    public async Task ChangePassword_WithWrongCurrent_ThrowsUnauthorized()
    {
        var user = new User
        {
            Name = "Test",
            Email = "changefail@test.com",
            Phone = "01012345678",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("oldpassword"),
            Role = UserRole.Customer,
            CreatedAt = DateTime.UtcNow
        };
        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        var dto = new ChangePasswordDto { CurrentPassword = "wrongpassword", NewPassword = "newpassword" };
        var act = () => _service.ChangePasswordAsync(user.Id, dto);

        await act.Should().ThrowAsync<UnauthorizedException>()
            .Where(e => e.ErrorCode == "WRONG_PASSWORD");
    }

    // --- UpdateProfile Tests ---

    [Fact]
    public async Task UpdateProfile_UpdatesNameAndPhone()
    {
        var user = new User
        {
            Name = "OldName",
            Email = "profile@test.com",
            Phone = "01000000000",
            PasswordHash = "hash",
            Role = UserRole.Customer,
            CreatedAt = DateTime.UtcNow
        };
        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        var dto = new UpdateProfileDto { Name = "NewName", Phone = "01111111111" };
        var result = await _service.UpdateProfileAsync(user.Id, dto);

        result.Name.Should().Be("NewName");
        result.Phone.Should().Be("01111111111");
    }

    // --- ForgotPassword Tests ---

    [Fact]
    public async Task ForgotPassword_WithExistingEmail_SendsEmail()
    {
        _db.Users.Add(new User
        {
            Name = "Test",
            Email = "forgot@test.com",
            Phone = "01012345678",
            PasswordHash = "hash",
            Role = UserRole.Customer,
            CreatedAt = DateTime.UtcNow
        });
        await _db.SaveChangesAsync();

        var dto = new ForgotPasswordDto { Email = "forgot@test.com" };
        await _service.ForgotPasswordAsync(dto);

        _mockEmail.Verify(e => e.SendPasswordResetAsync("forgot@test.com", It.IsAny<string>(), It.IsAny<string>()), Times.Once);
    }

    [Fact]
    public async Task ForgotPassword_WithNonExistentEmail_DoesNotThrow()
    {
        var dto = new ForgotPasswordDto { Email = "nonexistent@test.com" };

        var act = () => _service.ForgotPasswordAsync(dto);

        await act.Should().NotThrowAsync();
        _mockEmail.Verify(e => e.SendPasswordResetAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>()), Times.Never);
    }
}
