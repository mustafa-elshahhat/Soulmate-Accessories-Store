namespace SoulmateStore.Models;

public class BoxReview
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public Guid BoxTypeId { get; set; }
    public Guid OrderId { get; set; }
    public int Rating { get; set; }
    public string? Comment { get; set; }
    public DateTime CreatedAt { get; set; }

    public User User { get; set; } = null!;
    public BoxType BoxType { get; set; } = null!;
    public Order Order { get; set; } = null!;
}
