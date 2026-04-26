namespace SoulmateStore.Models;

public class CategoryCustomizationPrice
{
    public Guid Id { get; set; }
    public string Category { get; set; } = "";
    public decimal Price { get; set; }
}
