namespace SoulmateStore.Models;

public class OrderItem
{
    public Guid Id { get; set; }
    public Guid OrderId { get; set; }
    public Guid? ProductId { get; set; }
    public Guid? BoxTypeId { get; set; }
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public string CustomDataJson { get; set; } = "{}";

    public Order Order { get; set; } = null!;
    public Product? Product { get; set; }
    public BoxType? BoxType { get; set; }
}
