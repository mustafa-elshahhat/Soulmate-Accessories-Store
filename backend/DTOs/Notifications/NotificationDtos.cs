namespace SoulmateStore.DTOs.Notifications;

public record NotificationDto
{
    public Guid Id { get; init; }
    public string Title { get; init; } = "";
    public string TitleEn { get; init; } = "";
    public string Message { get; init; } = "";
    public string MessageEn { get; init; } = "";
    public bool IsRead { get; init; }
    public Guid? OrderId { get; init; }
    public DateTime CreatedAt { get; init; }
}

public record NotificationListData
{
    public List<NotificationDto> Items { get; init; } = [];
    public int UnreadCount { get; init; }
}
