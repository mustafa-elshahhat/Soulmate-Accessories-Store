using SoulmateStore.DTOs.Auth;

namespace SoulmateStore.Services.Interfaces;

public interface IAuthService
{
    Task<(AuthResponseDto Response, string RefreshToken)> RegisterAsync(RegisterDto dto, string lang = "ar");
    Task<(AuthResponseDto Response, string RefreshToken)> LoginAsync(LoginDto dto, string lang = "ar");
    Task<UserDto> GetMeAsync(Guid userId);
    Task<(AuthResponseDto Response, string RefreshToken)> RefreshTokenAsync(string refreshToken);
    Task LogoutAsync(string refreshToken);
    Task ForgotPasswordAsync(ForgotPasswordDto dto);
    Task ResetPasswordAsync(ResetPasswordDto dto);
    Task ChangePasswordAsync(Guid userId, ChangePasswordDto dto);
    Task<UserDto> UpdateProfileAsync(Guid userId, UpdateProfileDto dto);
    Task UpdateLangAsync(Guid userId, string lang);
}
