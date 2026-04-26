namespace SoulmateStore.DTOs.Cart;

public record SaveCartDto
{
    public string ItemsJson { get; init; } = "[]";
}

public record CartResponseDto
{
    public string ItemsJson { get; init; } = "[]";
    public DateTime UpdatedAt { get; init; }
}
