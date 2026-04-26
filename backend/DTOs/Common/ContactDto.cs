using System.ComponentModel.DataAnnotations;

namespace SoulmateStore.DTOs.Common;

public record ContactDto
{
    [Required, MaxLength(100)]
    public string Name { get; init; } = "";

    [Required, EmailAddress, MaxLength(200)]
    public string Email { get; init; } = "";

    [Required, MaxLength(2000)]
    public string Message { get; init; } = "";
}
