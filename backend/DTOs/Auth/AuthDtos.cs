using System.ComponentModel.DataAnnotations;
using SoulmateStore.Models.Enums;

namespace SoulmateStore.DTOs.Auth;

public record RegisterDto
{
    [Required(ErrorMessage = "الاسم مطلوب")]
    [MaxLength(100)]
    public string Name { get; init; } = "";

    [Required(ErrorMessage = "الإيميل مطلوب")]
    [EmailAddress(ErrorMessage = "صيغة الإيميل غلط")]
    public string Email { get; init; } = "";

    [Required(ErrorMessage = "كلمة المرور مطلوبة")]
    [MinLength(8, ErrorMessage = "كلمة المرور لازم 8 حروف على الأقل")]
    public string Password { get; init; } = "";

    [Required(ErrorMessage = "رقم التليفون مطلوب")]
    [RegularExpression(@"^01[0125]\d{8}$", ErrorMessage = "رقم التليفون لازم يكون 11 رقم ويبدأ بـ 010 أو 011 أو 012 أو 015")]
    public string Phone { get; init; } = "";
}

public record LoginDto
{
    [Required(ErrorMessage = "الإيميل مطلوب")]
    [EmailAddress]
    public string Email { get; init; } = "";

    [Required(ErrorMessage = "كلمة المرور مطلوبة")]
    public string Password { get; init; } = "";
}

public record AuthResponseDto
{
    public string AccessToken { get; init; } = "";
    public UserDto User { get; init; } = null!;
}

public record UserDto
{
    public Guid Id { get; init; }
    public string Name { get; init; } = "";
    public string Email { get; init; } = "";
    public string Phone { get; init; } = "";
    public UserRole Role { get; init; }
    public DateTime CreatedAt { get; init; }
}

public record ForgotPasswordDto
{
    [Required(ErrorMessage = "الإيميل مطلوب")]
    [EmailAddress]
    public string Email { get; init; } = "";

    public string? Lang { get; init; }
}

public record ResetPasswordDto
{
    [Required]
    public string Token { get; init; } = "";

    [Required(ErrorMessage = "كلمة المرور الجديدة مطلوبة")]
    [MinLength(8, ErrorMessage = "كلمة المرور لازم 8 حروف على الأقل")]
    public string NewPassword { get; init; } = "";
}

public record ChangePasswordDto
{
    [Required(ErrorMessage = "كلمة المرور الحالية مطلوبة")]
    public string CurrentPassword { get; init; } = "";

    [Required(ErrorMessage = "كلمة المرور الجديدة مطلوبة")]
    [MinLength(8, ErrorMessage = "كلمة المرور لازم 8 حروف على الأقل")]
    public string NewPassword { get; init; } = "";
}

public record UpdateProfileDto
{
    [Required(ErrorMessage = "الاسم مطلوب")]
    [MaxLength(100)]
    public string Name { get; init; } = "";

    [Required(ErrorMessage = "رقم التليفون مطلوب")]
    [RegularExpression(@"^01[0125]\d{8}$", ErrorMessage = "رقم التليفون لازم يكون 11 رقم ويبدأ بـ 010 أو 011 أو 012 أو 015")]
    public string Phone { get; init; } = "";
}

public record UpdateLangDto
{
    [Required]
    public string Lang { get; init; } = "ar";
}
