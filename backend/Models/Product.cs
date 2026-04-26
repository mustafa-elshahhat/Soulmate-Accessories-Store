using SoulmateStore.Models.Enums;

namespace SoulmateStore.Models;

public class Product
{
    public Guid Id { get; set; }
    public string Name { get; set; } = "";
    public string NameEn { get; set; } = "";
    public string Slug { get; set; } = "";
    public string Description { get; set; } = "";
    public string DescriptionEn { get; set; } = "";
    public decimal Price { get; set; }
    public string ImageUrl { get; set; } = "";
    public string? GalleryJson { get; set; }
    public string Category { get; set; } = "";
    public Gender Gender { get; set; }
    public bool IsActive { get; set; } = true;
    public bool IsStandalone { get; set; }
    public bool IsBuilderItem { get; set; }
    public bool IsCustomizable { get; set; }
    public int StockQuantity { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
