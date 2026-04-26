namespace SoulmateStore.Models;

public class Governorate
{
    public Guid Id { get; set; }
    public string Name { get; set; } = "";
    public string NameEn { get; set; } = "";
    public decimal ShippingCost { get; set; }
    public bool IsActive { get; set; } = true;
}
