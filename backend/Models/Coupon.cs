using SoulmateStore.Models.Enums;

namespace SoulmateStore.Models;

public class Coupon
{
    public Guid Id { get; set; }
    public string Code { get; set; } = "";
    public DiscountType DiscountType { get; set; }
    public decimal Value { get; set; }
    public int MaxUses { get; set; }
    public int UsedCount { get; set; }
    public DateTime ExpirationDate { get; set; }
    public bool IsActive { get; set; } = true;
    public decimal? MinOrderAmount { get; set; }
    public DateTime CreatedAt { get; set; }
}
