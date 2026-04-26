using SoulmateStore.DTOs.Notifications;

namespace SoulmateStore.Services.Interfaces;

public interface INotificationService
{
    Task CreateAsync(Guid userId, string title, string titleEn, string message, string messageEn, Guid? orderId = null);
    Task<List<NotificationDto>> GetByUserAsync(Guid userId, int page = 1, int limit = 20);
    Task MarkAsReadAsync(Guid id, Guid userId);
    Task MarkAllAsReadAsync(Guid userId);
    Task<int> GetUnreadCountAsync(Guid userId);
}
