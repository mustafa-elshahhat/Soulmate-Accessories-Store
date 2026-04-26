using System.ComponentModel.DataAnnotations;
using SoulmateStore.Models.Enums;

namespace SoulmateStore.DTOs.Promotions;

public record CreatePromotionDto
{
    [Required]
    [MaxLength(200)]
    public string Name { get; init; } = "";

    [MaxLength(200)]
    public string NameEn { get; init; } = "";

    [Required]
    public DiscountType DiscountType { get; init; }

    [Required]
    [Range(0.01, double.MaxValue)]
    public decimal Value { get; init; }

    [Required]
    public DateTime StartDate { get; init; }

    [Required]
    public DateTime EndDate { get; init; }

    public Guid? ProductId { get; init; }

    [MaxLength(50)]
    public string? Category { get; init; }
}

public record UpdatePromotionDto
{
    [Required]
    [MaxLength(200)]
    public string Name { get; init; } = "";

    [MaxLength(200)]
    public string NameEn { get; init; } = "";

    [Required]
    public DiscountType DiscountType { get; init; }

    [Required]
    [Range(0.01, double.MaxValue)]
    public decimal Value { get; init; }

    [Required]
    public DateTime StartDate { get; init; }

    [Required]
    public DateTime EndDate { get; init; }

    public bool IsActive { get; init; }
    public Guid? ProductId { get; init; }

    [MaxLength(50)]
    public string? Category { get; init; }
}

public record PromotionResponseDto
{
    public Guid Id { get; init; }
    public string Name { get; init; } = "";
    public string NameEn { get; init; } = "";
    public DiscountType DiscountType { get; init; }
    public decimal Value { get; init; }
    public DateTime StartDate { get; init; }
    public DateTime EndDate { get; init; }
    public bool IsActive { get; init; }
    public Guid? ProductId { get; init; }
    public string? ProductName { get; init; }
    public string? Category { get; init; }
    public DateTime CreatedAt { get; init; }
}
