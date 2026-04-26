using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using SoulmateStore.Data;
using SoulmateStore.DTOs.Notifications;
using SoulmateStore.Models;
using SoulmateStore.Services.Interfaces;

namespace SoulmateStore.Services.Implementations;

public class NotificationService : INotificationService
{
    private readonly AppDbContext _db;
    private readonly ILogger<NotificationService> _logger;

    public NotificationService(AppDbContext db, ILogger<NotificationService> logger)
    {
        _db = db;
        _logger = logger;
    }

    public async Task CreateAsync(Guid userId, string title, string titleEn, string message, string messageEn, Guid? orderId = null)
    {
        var notification = new Notification
        {
            UserId = userId,
            Title = title,
            TitleEn = titleEn,
            Message = message,
            MessageEn = messageEn,
            IsRead = false,
            OrderId = orderId,
            CreatedAt = DateTime.UtcNow
        };

        _db.Notifications.Add(notification);
        await _db.SaveChangesAsync();

        _logger.LogInformation("Notification created for user {UserId}", userId);
    }

    public async Task<List<NotificationDto>> GetByUserAsync(Guid userId, int page = 1, int limit = 20)
    {
        return await _db.Notifications
            .AsNoTracking()
            .Where(n => n.UserId == userId)
            .OrderByDescending(n => n.CreatedAt)
            .Skip((page - 1) * limit)
            .Take(limit)
            .Select(n => new NotificationDto
            {
                Id = n.Id,
                Title = n.Title,
                TitleEn = n.TitleEn,
                Message = n.Message,
                MessageEn = n.MessageEn,
                IsRead = n.IsRead,
                OrderId = n.OrderId,
                CreatedAt = n.CreatedAt
            })
            .ToListAsync();
    }

    public async Task MarkAsReadAsync(Guid id, Guid userId)
    {
        var notification = await _db.Notifications
            .FirstOrDefaultAsync(n => n.Id == id && n.UserId == userId);

        if (notification is null) return;

        notification.IsRead = true;
        await _db.SaveChangesAsync();
    }

    public async Task MarkAllAsReadAsync(Guid userId)
    {
        await _db.Notifications
            .Where(n => n.UserId == userId && !n.IsRead)
            .ExecuteUpdateAsync(s => s.SetProperty(n => n.IsRead, true));
    }

    public async Task<int> GetUnreadCountAsync(Guid userId)
    {
        return await _db.Notifications
            .AsNoTracking()
            .CountAsync(n => n.UserId == userId && !n.IsRead);
    }
}
