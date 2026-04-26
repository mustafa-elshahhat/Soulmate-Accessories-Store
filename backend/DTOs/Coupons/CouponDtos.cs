using System.ComponentModel.DataAnnotations;
using SoulmateStore.Models.Enums;

namespace SoulmateStore.DTOs.Coupons;

public record CreateCouponDto
{
    [Required]
    [MaxLength(50)]
    public string Code { get; init; } = "";

    [Required]
    public DiscountType DiscountType { get; init; }

    [Required]
    [Range(0.01, double.MaxValue)]
    public decimal Value { get; init; }

    [Required]
    [Range(1, int.MaxValue)]
    public int MaxUses { get; init; }

    [Required]
    public DateTime ExpirationDate { get; init; }

    public decimal? MinOrderAmount { get; init; }
}

public record UpdateCouponDto
{
    [Required]
    [MaxLength(50)]
    public string Code { get; init; } = "";

    [Required]
    public DiscountType DiscountType { get; init; }

    [Required]
    [Range(0.01, double.MaxValue)]
    public decimal Value { get; init; }

    [Required]
    [Range(1, int.MaxValue)]
    public int MaxUses { get; init; }

    [Required]
    public DateTime ExpirationDate { get; init; }

    public bool IsActive { get; init; }
    public decimal? MinOrderAmount { get; init; }
}

public record CouponResponseDto
{
    public Guid Id { get; init; }
    public string Code { get; init; } = "";
    public DiscountType DiscountType { get; init; }
    public decimal Value { get; init; }
    public int MaxUses { get; init; }
    public int UsedCount { get; init; }
    public DateTime ExpirationDate { get; init; }
    public bool IsActive { get; init; }
    public decimal? MinOrderAmount { get; init; }
    public DateTime CreatedAt { get; init; }
}

public record ValidateCouponDto
{
    [Required]
    [MaxLength(50)]
    public string Code { get; init; } = "";

    [Required]
    [Range(0.01, double.MaxValue)]
    public decimal OrderTotal { get; init; }
}

public record CouponValidationResultDto
{
    public bool Valid { get; init; }
    public string? ErrorCode { get; init; }
    public string? ErrorMessage { get; init; }
    public decimal DiscountAmount { get; init; }
    public string Code { get; init; } = "";
    public DiscountType? DiscountType { get; init; }
    public decimal? Value { get; init; }
}
