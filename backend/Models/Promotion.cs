using SoulmateStore.Models.Enums;

namespace SoulmateStore.Models;

public class Promotion
{
    public Guid Id { get; set; }
    public string Name { get; set; } = "";
    public string NameEn { get; set; } = "";
    public DiscountType DiscountType { get; set; }
    public decimal Value { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public bool IsActive { get; set; } = true;
    public Guid? ProductId { get; set; }
    public string? Category { get; set; }
    public DateTime CreatedAt { get; set; }

    public Product? Product { get; set; }
}
