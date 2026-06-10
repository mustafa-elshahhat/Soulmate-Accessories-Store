using Microsoft.EntityFrameworkCore;
using SoulmateStore.Data;
using SoulmateStore.DTOs.Payments;
using SoulmateStore.Exceptions;
using SoulmateStore.Models;
using SoulmateStore.Models.Enums;
using SoulmateStore.Services.Interfaces;

namespace SoulmateStore.Services.Implementations;

public class PaymentService : IPaymentService
{
    private readonly AppDbContext _db;
    private readonly IUploadService _upload;
    private readonly INotificationService _notifications;
    private readonly IBackgroundNotificationQueue _bgQueue;
    private readonly IConfiguration _config;
    private readonly ILogger<PaymentService> _logger;

    public PaymentService(
        AppDbContext db,
        IUploadService upload,
        INotificationService notifications,
        IBackgroundNotificationQueue bgQueue,
        IConfiguration config,
        ILogger<PaymentService> logger)
    {
        _db = db;
        _upload = upload;
        _notifications = notifications;
        _bgQueue = bgQueue;
        _config = config;
        _logger = logger;
    }

    public async Task<PaymentResponseDto> UploadReceiptAsync(Guid orderId, Guid userId, PaymentMethod method, IFormFile screenshot)
    {
        var order = await _db.Orders.FirstOrDefaultAsync(o => o.Id == orderId && o.UserId == userId)
            ?? throw new NotFoundException("ORDER_NOT_FOUND", "الطلب مش موجود");

        // Only allow upload when pending (waiting for payment) - NOT during payment_review or after
        if (order.Status != OrderStatus.Pending)
            throw new ConflictException("INVALID_STATUS", "مش ممكن رفع إيصال في الحالة الحالية. الطلب لازم يكون في حالة الانتظار");

        var maxAttempts = int.Parse(_config["Payment:MaxAttempts"] ?? "3");
        var lastPayment = await _db.Payments
            .AsNoTracking()
            .Where(p => p.OrderId == orderId)
            .OrderByDescending(p => p.AttemptNumber)
            .FirstOrDefaultAsync();

        if (lastPayment is not null && lastPayment.AttemptNumber >= maxAttempts && lastPayment.Status == PaymentStatus.Rejected)
            throw new ConflictException("MAX_ATTEMPTS", "تم تجاوز الحد الأقصى لمحاولات الدفع");

        var screenshotUrl = await _upload.UploadImageAsync(screenshot);
        var attemptNumber = (lastPayment?.AttemptNumber ?? 0) + 1;

        var payment = new Payment
        {
            OrderId = orderId,
            Method = method,
            ScreenshotUrl = screenshotUrl,
            Status = PaymentStatus.Pending,
            AttemptNumber = attemptNumber,
            CreatedAt = DateTime.UtcNow
        };

        _db.Payments.Add(payment);
        order.Status = OrderStatus.PaymentReview;
        order.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        await _notifications.CreateAsync(userId, "تم رفع الإيصال", "Receipt Uploaded", $"تم رفع إيصال الدفع للطلب رقم {order.OrderNumber}", $"Payment receipt uploaded for order #{order.OrderNumber}", orderId);

        // Notify admins
        var admins = await _db.Users.AsNoTracking().Where(u => u.Role == UserRole.Admin).ToListAsync();
        foreach (var admin in admins)
            await _notifications.CreateAsync(admin.Id, "إيصال دفع جديد", "New Payment Receipt", $"تم رفع إيصال دفع جديد للطلب رقم {order.OrderNumber}", $"New payment receipt uploaded for order #{order.OrderNumber}", orderId);

        _logger.LogInformation("Payment receipt uploaded for order {OrderId}, attempt {Attempt}", orderId, attemptNumber);

        return new PaymentResponseDto
        {
            Id = payment.Id,
            OrderId = payment.OrderId,
            Method = payment.Method,
            ScreenshotUrl = payment.ScreenshotUrl,
            Status = payment.Status,
            AttemptNumber = payment.AttemptNumber,
            CreatedAt = payment.CreatedAt
        };
    }

    public async Task<PaymentResponseDto?> GetByOrderAsync(Guid orderId, Guid userId)
    {
        var order = await _db.Orders.AsNoTracking().FirstOrDefaultAsync(o => o.Id == orderId && o.UserId == userId)
            ?? throw new NotFoundException("ORDER_NOT_FOUND", "الطلب مش موجود");

        var payment = await _db.Payments
            .AsNoTracking()
            .Where(p => p.OrderId == orderId)
            .OrderByDescending(p => p.AttemptNumber)
            .FirstOrDefaultAsync();

        if (payment is null) return null;

        return new PaymentResponseDto
        {
            Id = payment.Id,
            OrderId = payment.OrderId,
            Method = payment.Method,
            ScreenshotUrl = payment.ScreenshotUrl,
            Status = payment.Status,
            AdminNote = payment.AdminNote,
            AttemptNumber = payment.AttemptNumber,
            CreatedAt = payment.CreatedAt
        };
    }

    public async Task VerifyAsync(Guid paymentId, string? adminNote)
    {
        var payment = await _db.Payments.Include(p => p.Order).ThenInclude(o => o.User)
            .FirstOrDefaultAsync(p => p.Id == paymentId)
            ?? throw new NotFoundException("PAYMENT_NOT_FOUND", "الدفعة مش موجودة");

        if (payment.Status != PaymentStatus.Pending)
            throw new ConflictException("INVALID_PAYMENT_STATUS", $"الدفعة ليست في حالة انتظار. الحالة الحالية: {payment.Status}");

        if (payment.Order.Status != OrderStatus.PaymentReview)
            throw new ConflictException("INVALID_ORDER_STATUS", $"حالة الطلب غير صالحة للمراجعة. الحالة الحالية: {payment.Order.Status}");

        payment.Status = PaymentStatus.Verified;
        payment.AdminNote = adminNote;

        var order = payment.Order;
        order.Status = OrderStatus.Processing;
        order.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        var user = order.User;
        await _notifications.CreateAsync(user.Id, "تم تأكيد الدفع", "Payment Verified", $"تم التحقق من دفع الطلب رقم {order.OrderNumber}", $"Payment verified for order #{order.OrderNumber}", order.Id);
        {
            var userEmail = user.Email;
            var orderNum = order.OrderNumber;
            var lang = user.PreferredLang;
            await _bgQueue.EnqueueAsync(async (sp, ct) =>
            {
                var emailSvc = sp.GetRequiredService<IEmailService>();
                await emailSvc.SendPaymentVerifiedAsync(userEmail, orderNum, lang);
            });
        }

        _logger.LogInformation("Payment {PaymentId} verified for order {OrderNumber}", paymentId, order.OrderNumber);
    }

    public async Task RejectAsync(Guid paymentId, string reason)
    {
        var payment = await _db.Payments.Include(p => p.Order).ThenInclude(o => o.User)
            .FirstOrDefaultAsync(p => p.Id == paymentId)
            ?? throw new NotFoundException("PAYMENT_NOT_FOUND", "الدفعة مش موجودة");

        if (payment.Status != PaymentStatus.Pending)
            throw new ConflictException("INVALID_PAYMENT_STATUS", $"الدفعة ليست في حالة انتظار. الحالة الحالية: {payment.Status}");

        if (payment.Order.Status != OrderStatus.PaymentReview)
            throw new ConflictException("INVALID_ORDER_STATUS", $"حالة الطلب غير صالحة للمراجعة. الحالة الحالية: {payment.Order.Status}");

        payment.Status = PaymentStatus.Rejected;
        payment.AdminNote = reason;

        var order = payment.Order;
        order.Status = OrderStatus.Pending;
        order.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        var user = order.User;
        await _notifications.CreateAsync(user.Id, "تم رفض الدفع", "Payment Rejected", $"تم رفض إيصال الطلب رقم {order.OrderNumber}: {reason}", $"Payment rejected for order #{order.OrderNumber}: {reason}", order.Id);
        {
            var userEmail = user.Email;
            var orderNum = order.OrderNumber;
            var lang = user.PreferredLang;
            await _bgQueue.EnqueueAsync(async (sp, ct) =>
            {
                var emailSvc = sp.GetRequiredService<IEmailService>();
                await emailSvc.SendPaymentRejectedAsync(userEmail, orderNum, reason, lang);
            });
        }

        _logger.LogInformation("Payment {PaymentId} rejected for order {OrderNumber}", paymentId, order.OrderNumber);
    }

    public Task<PaymentInfoDto> GetPaymentInfoAsync()
    {
        var info = new PaymentInfoDto
        {
            VodafoneCashNumber = _config["Payment:VodafoneCashNumber"] ?? "",
            InstaPayNumber = _config["Payment:InstaPayNumber"] ?? ""
        };

        return Task.FromResult(info);
    }
}
