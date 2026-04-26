using Microsoft.EntityFrameworkCore;
using SoulmateStore.Data;
using SoulmateStore.Models;
using SoulmateStore.Models.Enums;
using SoulmateStore.Services.Interfaces;

namespace SoulmateStore.Services.Implementations;

public class OrderNotificationService : IOrderNotificationService
{
    private readonly AppDbContext _db;
    private readonly INotificationService _notifications;
    private readonly IBackgroundNotificationQueue _bgQueue;

    public OrderNotificationService(
        AppDbContext db,
        INotificationService notifications,
        IBackgroundNotificationQueue bgQueue)
    {
        _db = db;
        _notifications = notifications;
        _bgQueue = bgQueue;
    }

    public async Task NotifyOrderCreatedAsync(Order order, User user)
    {
        // DB notification
        await _notifications.CreateAsync(user.Id, "طلب جديد", "New Order", $"تم إنشاء طلبك رقم {order.OrderNumber} بنجاح", $"Your order #{order.OrderNumber} has been created successfully", order.Id);
        
        var userEmail = user.Email;
        var userPhone = user.Phone;
        var userName = user.Name;
        var userLang = user.PreferredLang;
        var orderNumber = order.OrderNumber;
        var orderId = order.Id;

        // Background tasks
        await _bgQueue.EnqueueAsync(async (sp, ct) =>
        {
            var email = sp.GetRequiredService<IEmailService>();
            await email.SendOrderCreatedAsync(userEmail, orderNumber, userLang);
        });

        await _bgQueue.EnqueueAsync(async (sp, ct) =>
        {
            var whatsApp = sp.GetRequiredService<IWhatsAppService>();
            await whatsApp.SendOrderCreatedAsync(userPhone, userName, orderNumber, orderId, userLang);
        });

        // Notify admins
        var admins = await _db.Users.AsNoTracking().Where(u => u.Role == UserRole.Admin).ToListAsync();
        foreach (var admin in admins)
        {
            await _notifications.CreateAsync(admin.Id, "طلب جديد", "New Order", $"طلب جديد رقم {orderNumber} من {user.Name}", $"New order #{orderNumber} from {user.Name}", order.Id);
        }
    }

    public async Task NotifyStatusChangedAsync(Order order, User user, OrderStatus newStatus)
    {
        var email = user.Email;
        var phone = user.Phone;
        var name = user.Name;
        var orderNumber = order.OrderNumber;
        var orderId = order.Id;
        var lang = user.PreferredLang;

        switch (newStatus)
        {
            case OrderStatus.Shipped:
                await _notifications.CreateAsync(user.Id, "تم الشحن", "Order Shipped", $"تم شحن طلبك رقم {orderNumber}", $"Your order #{orderNumber} has been shipped", orderId);
                await _bgQueue.EnqueueAsync(async (sp, ct) => {
                    var emailSvc = sp.GetRequiredService<IEmailService>();
                    await emailSvc.SendOrderShippedAsync(email, orderNumber, lang);
                });
                await _bgQueue.EnqueueAsync(async (sp, ct) => {
                    var whatsApp = sp.GetRequiredService<IWhatsAppService>();
                    await whatsApp.SendOrderShippedAsync(phone, name, orderNumber, orderId, lang);
                });
                break;

            case OrderStatus.Delivered:
                await _notifications.CreateAsync(user.Id, "تم التسليم", "Order Delivered", $"تم تسليم طلبك رقم {orderNumber}", $"Your order #{orderNumber} has been delivered", orderId);
                await _bgQueue.EnqueueAsync(async (sp, ct) => {
                    var emailSvc = sp.GetRequiredService<IEmailService>();
                    await emailSvc.SendOrderDeliveredAsync(email, orderNumber, lang);
                });
                await _bgQueue.EnqueueAsync(async (sp, ct) => {
                    var whatsApp = sp.GetRequiredService<IWhatsAppService>();
                    await whatsApp.SendOrderDeliveredAsync(phone, name, orderNumber, orderId, lang);
                });
                break;

            case OrderStatus.Cancelled:
                await _notifications.CreateAsync(user.Id, "تم إلغاء الطلب", "Order Cancelled", $"تم إلغاء طلبك رقم {orderNumber}", $"Your order #{orderNumber} has been cancelled", orderId);
                await _bgQueue.EnqueueAsync(async (sp, ct) => {
                    var whatsApp = sp.GetRequiredService<IWhatsAppService>();
                    await whatsApp.SendOrderCancelledAsync(phone, name, orderNumber, orderId, lang);
                });
                break;
        }
    }
}
