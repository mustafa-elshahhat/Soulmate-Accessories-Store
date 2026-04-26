using Microsoft.EntityFrameworkCore;
using SoulmateStore.Data;
using SoulmateStore.Models.Enums;
using SoulmateStore.Services.Interfaces;

namespace SoulmateStore.Services.Implementations;

public class OrderExpirationService : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly IConfiguration _config;
    private readonly ILogger<OrderExpirationService> _logger;

    public OrderExpirationService(IServiceScopeFactory scopeFactory, IConfiguration config, ILogger<OrderExpirationService> logger)
    {
        _scopeFactory = scopeFactory;
        _config = config;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await CancelExpiredOrders(stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error cancelling expired orders");
            }

            await Task.Delay(TimeSpan.FromHours(1), stoppingToken);
        }
    }

    private async Task CancelExpiredOrders(CancellationToken ct)
    {
        var hoursLimit = _config.GetValue<int>("OrderExpiration:PendingHoursLimit", 48);
        var cutoff = DateTime.UtcNow.AddHours(-hoursLimit);

        using var scope = _scopeFactory.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var notificationService = scope.ServiceProvider.GetRequiredService<INotificationService>();
        var emailService = scope.ServiceProvider.GetRequiredService<IEmailService>();

        var expired = await db.Orders
            .Include(o => o.User)
            .Include(o => o.OrderItems)
            .Where(o => o.Status == OrderStatus.Pending && o.CreatedAt < cutoff)
            .ToListAsync(ct);

        if (expired.Count == 0) return;

        var inventoryService = scope.ServiceProvider.GetRequiredService<IInventoryService>();

        foreach (var order in expired)
        {
            order.Status = OrderStatus.Cancelled;
            order.CancelReason = $"تم الإلغاء تلقائياً لعدم الدفع خلال {hoursLimit} ساعة";
            order.UpdatedAt = DateTime.UtcNow;
            
            // Restore stock
            await inventoryService.RestoreStockAsync(order.OrderItems.ToList());
        }

        await db.SaveChangesAsync(ct);

        // Send notifications and emails after successful save
        foreach (var order in expired)
        {
            try
            {
                await notificationService.CreateAsync(
                    order.UserId,
                    "تم إلغاء طلبك",
                    "Order Cancelled",
                    $"تم إلغاء الطلب رقم {order.OrderNumber} تلقائياً بسبب عدم الدفع خلال {hoursLimit} ساعة.",
                    $"Order #{order.OrderNumber} was automatically cancelled due to non-payment within {hoursLimit} hours.",
                    order.Id);

                if (!string.IsNullOrEmpty(order.User?.Email))
                {
                    await emailService.SendOrderCancelledAutoAsync(
                        order.User.Email, order.OrderNumber,
                        hoursLimit, order.User.Name, order.User.PreferredLang);
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to send expiration notification for order {OrderId}", order.Id);
            }
        }

        _logger.LogInformation("Cancelled {Count} expired pending orders", expired.Count);
    }
}
