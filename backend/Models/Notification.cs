namespace SoulmateStore.Models;

public class Notification
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string Title { get; set; } = "";
    public string TitleEn { get; set; } = "";
    public string Message { get; set; } = "";
    public string MessageEn { get; set; } = "";
    public bool IsRead { get; set; }
    public Guid? OrderId { get; set; }
    public DateTime CreatedAt { get; set; }

    public User User { get; set; } = null!;
    public Order? Order { get; set; }
}
