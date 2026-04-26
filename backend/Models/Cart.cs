namespace SoulmateStore.Models;

public class Cart
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string ItemsJson { get; set; } = "[]";
    public DateTime UpdatedAt { get; set; }

    public User User { get; set; } = null!;
}
