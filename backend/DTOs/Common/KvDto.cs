using System.ComponentModel.DataAnnotations;

namespace SoulmateStore.DTOs.Common;

public record KvDto
{
    [Required]
    public string Value { get; init; } = "";
}
