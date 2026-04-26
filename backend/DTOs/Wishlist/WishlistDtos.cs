namespace SoulmateStore.DTOs.Wishlist;

public record WishlistItemDto
{
    public Guid Id { get; init; }
    public Guid ProductId { get; init; }
    public string Name { get; init; } = "";
    public string NameEn { get; init; } = "";
    public string Slug { get; init; } = "";
    public decimal Price { get; init; }
    public string ImageUrl { get; init; } = "";
    public string Category { get; init; } = "";
    public int StockQuantity { get; init; }
    public DateTime CreatedAt { get; init; }
}
