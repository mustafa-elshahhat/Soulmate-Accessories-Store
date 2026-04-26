using System.Text;
using System.Text.Json;
using SoulmateStore.Services.Interfaces;

namespace SoulmateStore.Services.Implementations;

public class WhatsAppService : IWhatsAppService
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<WhatsAppService> _logger;
    private readonly string _internalKey;
    private readonly string _baseUrl;
    private readonly string _frontendUrl;

    public WhatsAppService(HttpClient httpClient, IConfiguration config, ILogger<WhatsAppService> logger, Microsoft.Extensions.Hosting.IHostEnvironment env)
    {
        _httpClient = httpClient;
        _logger = logger;
        _baseUrl = config["WhatsApp:ServiceUrl"] ?? "http://localhost:3001";
        _frontendUrl = config["FrontendUrl"] ?? "https://soulmate-frontend.vercel.app";
        
        var key = config["WhatsApp:InternalKey"];
        
        if (env.IsProduction())
        {
            if (string.IsNullOrWhiteSpace(key) || key == "dev-internal-key-change-in-production")
            {
                throw new InvalidOperationException("WhatsApp Internal Key is missing or insecure in production. Please set WhatsApp:InternalKey or environment variable WhatsApp__InternalKey.");
            }
            _internalKey = key;
        }
        else
        {
            _internalKey = key ?? "dev-internal-key-change-in-production";
        }

        if (!_httpClient.DefaultRequestHeaders.Contains("X-Internal-Key"))
        {
            _httpClient.DefaultRequestHeaders.Add("X-Internal-Key", _internalKey);
        }
    }

    private string OrderLink(Guid orderId) => $"{_frontendUrl}/orders/{orderId}";

    public Task SendOrderCreatedAsync(string phone, string customerName, string orderNumber, Guid orderId, string lang = "ar")
    {
        string message;
        if (lang == "en")
        {
            message =
                $"       🛍️ *Soulmate Store*\n" +
                $"       ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─\n\n" +
                $"Hi *{customerName}* 👋\n\n" +
                $"✅ Your order has been created successfully\n" +
                $"📋 Order Number: {orderNumber}\n" +
                $"📦 Status: Awaiting Payment\n\n" +
                $"💳 Please upload the payment receipt to complete your order\n\n" +
                $"🔗 {OrderLink(orderId)}\n\n" +
                $"       ❤️ *Soulmate Store*";
        }
        else
        {
            message =
                $"       🛍️ *Soulmate Store*\n" +
                $"       ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─\n\n" +
                $"\u200Fأهلاً بيك يا *\u202A{customerName}\u202C* 👋\n\n" +
                $"\u200F✅ تم إنشاء طلبك بنجاح\n" +
                $"\u200F📋 رقم الطلب: \u202A{orderNumber}\u202C\n" +
                $"\u200F📦 الحالة: في انتظار الدفع\n\n" +
                $"\u200F💳 يرجى رفع إيصال الدفع لإتمام الطلب\n\n" +
                $"🔗 {OrderLink(orderId)}\n\n" +
                $"       ❤️ *Soulmate Store*";
        }
        return SendMessageAsync(phone, message);
    }

    public Task SendPaymentVerifiedAsync(string phone, string customerName, string orderNumber, Guid orderId, string lang = "ar")
    {
        string message;
        if (lang == "en")
        {
            message =
                $"       🛍️ *Soulmate Store*\n" +
                $"       ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─\n\n" +
                $"Hi *{customerName}* 👋\n\n" +
                $"✅ Payment verified successfully\n" +
                $"📋 Order Number: {orderNumber}\n" +
                $"📦 Status: Processing\n\n" +
                $"We're preparing your order with love and care 🎁\n\n" +
                $"🔗 {OrderLink(orderId)}\n\n" +
                $"       ❤️ *Soulmate Store*";
        }
        else
        {
            message =
                $"       🛍️ *Soulmate Store*\n" +
                $"       ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─\n\n" +
                $"\u200Fأهلاً بيك يا *\u202A{customerName}\u202C* 👋\n\n" +
                $"\u200F✅ تم تأكيد الدفع بنجاح\n" +
                $"\u200F📋 رقم الطلب: \u202A{orderNumber}\u202C\n" +
                $"\u200F📦 الحالة: جاري التجهيز\n\n" +
                $"\u200Fبنجهّز طلبك بكل حب وعناية 🎁\n\n" +
                $"🔗 {OrderLink(orderId)}\n\n" +
                $"       ❤️ *Soulmate Store*";
        }
        return SendMessageAsync(phone, message);
    }

    public Task SendPaymentRejectedAsync(string phone, string customerName, string orderNumber, Guid orderId, string reason, string lang = "ar")
    {
        string message;
        if (lang == "en")
        {
            message =
                $"       🛍️ *Soulmate Store*\n" +
                $"       ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─\n\n" +
                $"Hi *{customerName}* 👋\n\n" +
                $"⚠️ Payment receipt notice\n" +
                $"📋 Order Number: {orderNumber}\n" +
                $"📌 Reason: {reason}\n\n" +
                $"Don't worry! Please upload a new receipt and we'll review it right away ✅\n\n" +
                $"🔗 {OrderLink(orderId)}\n\n" +
                $"       ❤️ *Soulmate Store*";
        }
        else
        {
            message =
                $"       🛍️ *Soulmate Store*\n" +
                $"       ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─\n\n" +
                $"\u200Fأهلاً بيك يا *\u202A{customerName}\u202C* 👋\n\n" +
                $"\u200F⚠️ تنبيه بخصوص إيصال الدفع\n" +
                $"\u200F📋 رقم الطلب: \u202A{orderNumber}\u202C\n" +
                $"\u200F📌 السبب: {reason}\n\n" +
                $"\u200Fمتقلقش! يرجى رفع إيصال جديد وهنراجعه فورًا ✅\n\n" +
                $"🔗 {OrderLink(orderId)}\n\n" +
                $"       ❤️ *Soulmate Store*";
        }
        return SendMessageAsync(phone, message);
    }

    public Task SendOrderShippedAsync(string phone, string customerName, string orderNumber, Guid orderId, string lang = "ar")
    {
        string message;
        if (lang == "en")
        {
            message =
                $"       🛍️ *Soulmate Store*\n" +
                $"       ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─\n\n" +
                $"Hi *{customerName}* 👋\n\n" +
                $"🚚 Your order is on the way\n" +
                $"📋 Order Number: {orderNumber}\n" +
                $"📦 Status: Shipped\n\n" +
                $"Your order is out for delivery! Get ready 🎉\n\n" +
                $"🔗 {OrderLink(orderId)}\n\n" +
                $"       ❤️ *Soulmate Store*";
        }
        else
        {
            message =
                $"       🛍️ *Soulmate Store*\n" +
                $"       ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─\n\n" +
                $"\u200Fأهلاً بيك يا *\u202A{customerName}\u202C* 👋\n\n" +
                $"\u200F🚚 طلبك في الطريق إليك\n" +
                $"\u200F📋 رقم الطلب: \u202A{orderNumber}\u202C\n" +
                $"\u200F📦 الحالة: تم الشحن\n\n" +
                $"\u200Fطلبك خرج وفي السكة! جهّز نفسك 🎉\n\n" +
                $"🔗 {OrderLink(orderId)}\n\n" +
                $"       ❤️ *Soulmate Store*";
        }
        return SendMessageAsync(phone, message);
    }

    public Task SendOrderDeliveredAsync(string phone, string customerName, string orderNumber, Guid orderId, string lang = "ar")
    {
        string message;
        if (lang == "en")
        {
            message =
                $"       🛍️ *Soulmate Store*\n" +
                $"       ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─\n\n" +
                $"Hi *{customerName}* 👋\n\n" +
                $"🎉 Your order has been delivered\n" +
                $"📋 Order Number: {orderNumber}\n" +
                $"📦 Status: Delivered\n\n" +
                $"We hope you love it! We'd love to hear your feedback ⭐\n\n" +
                $"🔗 {OrderLink(orderId)}\n\n" +
                $"       ❤️ *Soulmate Store*";
        }
        else
        {
            message =
                $"       🛍️ *Soulmate Store*\n" +
                $"       ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─\n\n" +
                $"\u200Fأهلاً بيك يا *\u202A{customerName}\u202C* 👋\n\n" +
                $"\u200F🎉 تم تسليم طلبك بنجاح\n" +
                $"\u200F📋 رقم الطلب: \u202A{orderNumber}\u202C\n" +
                $"\u200F📦 الحالة: تم التسليم\n\n" +
                $"\u200Fنتمنى يعجبك! لو حبيت تشاركنا رأيك هنفرح جدًا ⭐\n\n" +
                $"🔗 {OrderLink(orderId)}\n\n" +
                $"       ❤️ *Soulmate Store*";
        }
        return SendMessageAsync(phone, message);
    }

    public Task SendOrderCancelledAsync(string phone, string customerName, string orderNumber, Guid orderId, string lang = "ar")
    {
        string message;
        if (lang == "en")
        {
            message =
                $"       🛍️ *Soulmate Store*\n" +
                $"       ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─\n\n" +
                $"Hi *{customerName}* 👋\n\n" +
                $"📋 Order Number: {orderNumber}\n" +
                $"📦 Status: Order Cancelled\n\n" +
                $"If you need help or want to place a new order, we're always here 💙\n\n" +
                $"🔗 {OrderLink(orderId)}\n\n" +
                $"       ❤️ *Soulmate Store*";
        }
        else
        {
            message =
                $"       🛍️ *Soulmate Store*\n" +
                $"       ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─\n\n" +
                $"\u200Fأهلاً بيك يا *\u202A{customerName}\u202C* 👋\n\n" +
                $"\u200F📋 رقم الطلب: \u202A{orderNumber}\u202C\n" +
                $"\u200F📦 الحالة: تم إلغاء الطلب\n\n" +
                $"\u200Fلو محتاج أي مساعدة أو عايز تعمل طلب جديد، إحنا هنا دايمًا 💙\n\n" +
                $"🔗 {OrderLink(orderId)}\n\n" +
                $"       ❤️ *Soulmate Store*";
        }
        return SendMessageAsync(phone, message);
    }

    /// <summary>
    /// Normalizes Egyptian phone to 20XXXXXXXXXX format for WhatsApp.
    /// Handles: 01XXXXXXXXX, +201XXXXXXXXX, 201XXXXXXXXX, 1XXXXXXXXX
    /// </summary>
    private static string? NormalizePhone(string? phone)
    {
        if (string.IsNullOrWhiteSpace(phone)) return null;

        // Remove spaces, dashes, plus sign
        var cleaned = phone.Trim().Replace(" ", "").Replace("-", "").Replace("+", "");

        // 01XXXXXXXXX → 201XXXXXXXXX
        if (cleaned.StartsWith("01") && cleaned.Length == 11)
            return "2" + cleaned;

        // 201XXXXXXXXX (already correct)
        if (cleaned.StartsWith("20") && cleaned.Length == 12)
            return cleaned;

        // 1XXXXXXXXX → 201XXXXXXXXX
        if (cleaned.StartsWith("1") && cleaned.Length == 10)
            return "20" + cleaned;

        // 00201XXXXXXXXX → 201XXXXXXXXX
        if (cleaned.StartsWith("002") && cleaned.Length == 14)
            return cleaned[2..];

        return null; // unrecognized format
    }

    private async Task SendMessageAsync(string phone, string message)
    {
        try
        {
            var normalized = NormalizePhone(phone);
            if (normalized is null)
            {
                _logger.LogWarning("WhatsApp skipped — invalid or empty phone: {Phone}", phone);
                return;
            }

            var payload = new { phone = normalized, message };
            var content = new StringContent(
                JsonSerializer.Serialize(payload),
                Encoding.UTF8,
                "application/json");

            var response = await _httpClient.PostAsync($"{_baseUrl}/send-message", content);

            if (!response.IsSuccessStatusCode)
            {
                var body = await response.Content.ReadAsStringAsync();
                _logger.LogWarning("WhatsApp message failed for {Phone}: {Status} - {Body}",
                    phone, response.StatusCode, body);
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to send WhatsApp message to {Phone}", phone);
        }
    }
}
