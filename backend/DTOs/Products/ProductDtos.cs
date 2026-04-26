using System.ComponentModel.DataAnnotations;
using SoulmateStore.Models.Enums;

namespace SoulmateStore.DTOs.Products;

public record CreateProductDto
{
    [Required]
    [MaxLength(200)]
    public string Name { get; init; } = "";

    [MaxLength(200)]
    public string NameEn { get; init; } = "";

    [Required]
    public string Description { get; init; } = "";

    public string DescriptionEn { get; init; } = "";

    [Required]
    [Range(0.01, double.MaxValue, ErrorMessage = "السعر لازم يكون أكبر من صفر")]
    public decimal Price { get; init; }

    [Required]
    public string ImageUrl { get; init; } = "";

    public string? GalleryJson { get; init; }

    [Required]
    public string Category { get; init; } = "";

    public Gender Gender { get; init; }

    public bool IsStandalone { get; init; }
    public bool IsBuilderItem { get; init; }
    public bool IsCustomizable { get; init; }

    [Range(0, int.MaxValue)]
    public int StockQuantity { get; init; }
}

public record UpdateProductDto
{
    [Required]
    [MaxLength(200)]
    public string Name { get; init; } = "";

    [MaxLength(200)]
    public string NameEn { get; init; } = "";

    [Required]
    public string Description { get; init; } = "";

    public string DescriptionEn { get; init; } = "";

    [Required]
    [Range(0.01, double.MaxValue)]
    public decimal Price { get; init; }

    [Required]
    public string ImageUrl { get; init; } = "";

    public string? GalleryJson { get; init; }

    [Required]
    public string Category { get; init; } = "";

    public Gender Gender { get; init; }

    public bool IsActive { get; init; }
    public bool IsStandalone { get; init; }
    public bool IsBuilderItem { get; init; }
    public bool IsCustomizable { get; init; }

    [Range(0, int.MaxValue)]
    public int StockQuantity { get; init; }
}

public record ProductResponseDto
{
    public Guid Id { get; init; }
    public string Name { get; init; } = "";
    public string NameEn { get; init; } = "";
    public string Slug { get; init; } = "";
    public string Description { get; init; } = "";
    public string DescriptionEn { get; init; } = "";
    public decimal Price { get; init; }
    public string ImageUrl { get; init; } = "";
    public string? GalleryJson { get; init; }
    public string Category { get; init; } = "";
    public Gender Gender { get; init; }
    public bool IsActive { get; init; }
    public bool IsStandalone { get; init; }
    public bool IsBuilderItem { get; init; }
    public bool IsCustomizable { get; init; }
    public int StockQuantity { get; init; }
    public decimal? OriginalPrice { get; init; }
    public decimal? FinalPrice { get; init; }
    public decimal? DiscountPercentage { get; init; }
    public decimal CustomizationPrice { get; init; }
    public double AverageRating { get; init; }
    public int ReviewCount { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime UpdatedAt { get; init; }
}
