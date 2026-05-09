using System.Security.Claims;
using Microsoft.AspNetCore.Antiforgery;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using SoulmateStore.DTOs.Auth;
using SoulmateStore.DTOs.Common;
using SoulmateStore.Filters;
using SoulmateStore.Services.Interfaces;

namespace SoulmateStore.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly IConfiguration _config;
    private readonly IAntiforgery _antiforgery;

    public AuthController(IAuthService authService, IConfiguration config, IAntiforgery antiforgery)
    {
        _authService = authService;
        _config = config;
        _antiforgery = antiforgery;
    }

    [HttpPost("register")]
    [EnableRateLimiting("Auth")]
    public async Task<ActionResult<ApiResponse<AuthResponseDto>>> Register([FromBody] RegisterDto dto)
    {
        var lang = Request.Cookies["soulmate_lang"] ?? "ar";
        var (response, refreshToken) = await _authService.RegisterAsync(dto, lang);
        SetRefreshTokenCookie(refreshToken);
        return Ok(new ApiResponse<AuthResponseDto> { Data = response });
    }

    [HttpPost("login")]
    [EnableRateLimiting("Auth")]
    public async Task<ActionResult<ApiResponse<AuthResponseDto>>> Login([FromBody] LoginDto dto)
    {
        var lang = Request.Cookies["soulmate_lang"] ?? "ar";
        var (response, refreshToken) = await _authService.LoginAsync(dto, lang);
        SetRefreshTokenCookie(refreshToken);
        return Ok(new ApiResponse<AuthResponseDto> { Data = response });
    }

    [HttpPost("logout")]
    [ValidateCsrfToken]
    [EnableRateLimiting("Auth")]
    public async Task<ActionResult<ApiResponse<object>>> Logout()
    {
        var refreshToken = Request.Cookies["refreshToken"];
        if (!string.IsNullOrEmpty(refreshToken))
        {
            await _authService.LogoutAsync(refreshToken);
            Response.Cookies.Delete("refreshToken", new CookieOptions
            {
                Path = "/api/auth",
                HttpOnly = true,
                Secure = Request.IsHttps,
                SameSite = Request.IsHttps ? SameSiteMode.None : SameSiteMode.Lax
            });
        }

        return Ok(new ApiResponse<object> { Message = "تم تسجيل الخروج بنجاح" });
    }

    [HttpGet("csrf")]
    public IActionResult GetCsrfToken()
    {
        // CsrfTokenMiddleware already called GetAndStoreTokens for this GET request
        // (result is cached in HttpContext.Items), so this call returns the same token.
        // Returning it in the body lets cross-origin Angular apps read it without
        // relying on document.cookie, which cannot access cookies from another domain.
        var tokens = _antiforgery.GetAndStoreTokens(HttpContext);
        return Ok(new ApiResponse<object> { Data = new { csrf_token = tokens.RequestToken } });
    }

    [HttpPost("refresh")]
    [ValidateCsrfToken]
    [EnableRateLimiting("Auth")]
    public async Task<ActionResult<ApiResponse<AuthResponseDto>>> Refresh()
    {
        var refreshToken = Request.Cookies["refreshToken"];
        if (string.IsNullOrEmpty(refreshToken))
            return Unauthorized(new ApiErrorResponse
            {
                ErrorCode = "NO_REFRESH_TOKEN",
                Message = "مفيش refresh token",
                StatusCode = 401
            });

        var (response, newRefreshToken) = await _authService.RefreshTokenAsync(refreshToken);
        SetRefreshTokenCookie(newRefreshToken);
        return Ok(new ApiResponse<AuthResponseDto> { Data = response });
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<ActionResult<ApiResponse<UserDto>>> GetMe()
    {
        var userId = GetUserId();
        var user = await _authService.GetMeAsync(userId);
        return Ok(new ApiResponse<UserDto> { Data = user });
    }

    [HttpPut("profile")]
    [Authorize]
    public async Task<ActionResult<ApiResponse<UserDto>>> UpdateProfile([FromBody] UpdateProfileDto dto)
    {
        var userId = GetUserId();
        var user = await _authService.UpdateProfileAsync(userId, dto);
        return Ok(new ApiResponse<UserDto> { Data = user });
    }

    [HttpPut("change-password")]
    [Authorize]
    public async Task<ActionResult<ApiResponse<object>>> ChangePassword([FromBody] ChangePasswordDto dto)
    {
        var userId = GetUserId();
        await _authService.ChangePasswordAsync(userId, dto);
        return Ok(new ApiResponse<object> { Message = "تم تغيير كلمة المرور بنجاح" });
    }

    [HttpPost("forgot-password")]
    [EnableRateLimiting("Auth")]
    public async Task<ActionResult<ApiResponse<object>>> ForgotPassword([FromBody] ForgotPasswordDto dto)
    {
        await _authService.ForgotPasswordAsync(dto);
        // Always return success to prevent email enumeration
        return Ok(new ApiResponse<object> { Message = "لو الإيميل مسجل عندنا، هنبعتلك رابط إعادة تعيين" });
    }

    [HttpPost("reset-password")]
    [EnableRateLimiting("Auth")]
    public async Task<ActionResult<ApiResponse<object>>> ResetPassword([FromBody] ResetPasswordDto dto)
    {
        await _authService.ResetPasswordAsync(dto);
        return Ok(new ApiResponse<object> { Message = "تم تغيير كلمة المرور بنجاح" });
    }

    [HttpPatch("lang")]
    [Authorize]
    public async Task<ActionResult<ApiResponse<object>>> UpdateLang([FromBody] UpdateLangDto dto)
    {
        var userId = GetUserId();
        await _authService.UpdateLangAsync(userId, dto.Lang);
        return Ok(new ApiResponse<object> { Message = "ok" });
    }

    private Guid GetUserId()
    {
        var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(claim))
            throw new Exceptions.UnauthorizedException("INVALID_TOKEN", "User ID claim not found in token");
        return Guid.Parse(claim);
    }

    private void SetRefreshTokenCookie(string refreshToken)
    {
        Response.Cookies.Append("refreshToken", refreshToken, new CookieOptions
        {
            HttpOnly = true,
            Secure = Request.IsHttps,
            SameSite = Request.IsHttps ? SameSiteMode.None : SameSiteMode.Lax,
            Path = "/api/auth",
            Expires = DateTimeOffset.UtcNow.AddDays(int.Parse(_config["Jwt:RefreshTokenExpiresInDays"] ?? "7"))
        });
    }
}
