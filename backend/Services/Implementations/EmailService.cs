using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;
using SoulmateStore.Services.Interfaces;

namespace SoulmateStore.Services.Implementations;

public class EmailService : IEmailService
{
    private readonly IConfiguration _config;
    private readonly ILogger<EmailService> _logger;

    public EmailService(IConfiguration config, ILogger<EmailService> logger)
    {
        _config = config;
        _logger = logger;
    }

    public async Task SendAsync(string to, string subject, string htmlBody)
    {
        try
        {
            var fromEmail = _config["Mail:User"] ?? "soulmatestore1@gmail.com";
            var message = new MimeMessage();
            message.From.Add(new MailboxAddress("Soulmate Store", fromEmail));
            message.Sender = new MailboxAddress("Soulmate Store", fromEmail);
            message.ReplyTo.Add(new MailboxAddress("Soulmate Store", fromEmail));
            message.To.Add(MailboxAddress.Parse(to));
            message.Subject = subject;
            message.MessageId = MimeKit.Utils.MimeUtils.GenerateMessageId("soulmate-store.com");
            message.Date = DateTimeOffset.UtcNow;
            message.Headers.Add("X-Mailer", "Soulmate Store Mailer");
            message.Headers.Add("Precedence", "bulk");

            var builder = new BodyBuilder
            {
                HtmlBody = htmlBody,
                TextBody = HtmlToPlainText(htmlBody)
            };
            message.Body = builder.ToMessageBody();

            using var client = new SmtpClient();
            await client.ConnectAsync(
                _config["Mail:Host"] ?? throw new InvalidOperationException("Mail:Host is not configured"),
                int.Parse(_config["Mail:Port"] ?? "587"),
                SecureSocketOptions.StartTls);

            await client.AuthenticateAsync(
                _config["Mail:User"] ?? throw new InvalidOperationException("Mail:User is not configured"),
                _config["Mail:Password"] ?? throw new InvalidOperationException("Mail:Password is not configured"));

            await client.SendAsync(message);
            await client.DisconnectAsync(true);

            _logger.LogInformation("Email sent to {To}: {Subject}", to, subject);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send email to {To}: {Subject}", to, subject);
        }
    }

    public async Task SendContactAsync(string name, string email, string message)
    {
        var storeEmail = _config["Mail:User"] ?? "soulmatestore1@gmail.com";
        var safeName = Sanitize(name);
        var safeEmail = Sanitize(email);
        var safeMessage = Sanitize(message).Replace("\n", "<br>");

        var html = BuildEmailLayout($@"
            <div style='margin-bottom:24px;'>
                <div style='display:inline-block;padding:6px 14px;background:#C8A96E15;border-radius:8px;margin-bottom:16px;'>
                    <span style='font-size:13px;font-weight:600;color:#C8A96E;'>New Contact Message</span>
                </div>
                <table style='width:100%;font-size:14px;color:#374151;line-height:1.8;'>
                    <tr><td style='font-weight:600;padding:6px 12px 6px 0;vertical-align:top;white-space:nowrap;'>Name:</td><td style='padding:6px 0;'>{safeName}</td></tr>
                    <tr><td style='font-weight:600;padding:6px 12px 6px 0;vertical-align:top;white-space:nowrap;'>Email:</td><td style='padding:6px 0;'><a href='mailto:{safeEmail}' style='color:#C8A96E;'>{safeEmail}</a></td></tr>
                </table>
            </div>
            <div style='background:#F9FAFB;border-radius:12px;padding:20px;border:1px solid #E5E7EB;'>
                <p style='font-size:12px;font-weight:600;color:#9CA3AF;text-transform:uppercase;letter-spacing:0.05em;margin:0 0 8px;'>Message</p>
                <p style='font-size:14px;color:#374151;line-height:1.8;margin:0;'>{safeMessage}</p>
            </div>", "ltr");

        await SendAsync(storeEmail, $"Soulmate Store - Contact from {safeName}", html);
    }

    public async Task SendOrderCreatedAsync(string to, string orderNumber, string lang = "ar")
    {
        var isAr = lang == "ar";
        var title = isAr ? "تم إنشاء طلبك بنجاح ✅" : "Your Order Has Been Created ✅";
        var body = isAr
            ? $"رقم الطلب: <strong>{Sanitize(orderNumber)}</strong><br>يرجى رفع إيصال الدفع لإتمام الطلب."
            : $"Order Number: <strong>{Sanitize(orderNumber)}</strong><br>Please upload the payment receipt to complete your order.";
        var subject = isAr
            ? $"Soulmate Store - طلب جديد #{Sanitize(orderNumber)}"
            : $"Soulmate Store - New Order #{Sanitize(orderNumber)}";

        var html = BuildSingleLangEmail(title, body, "#C8A96E", lang);
        await SendAsync(to, subject, html);
    }

    public async Task SendPaymentVerifiedAsync(string to, string orderNumber, string lang = "ar")
    {
        var isAr = lang == "ar";
        var title = isAr ? "تم تأكيد الدفع ✅" : "Payment Verified ✅";
        var body = isAr
            ? $"رقم الطلب: <strong>{Sanitize(orderNumber)}</strong><br>جاري تجهيز طلبك للشحن."
            : $"Order Number: <strong>{Sanitize(orderNumber)}</strong><br>Your order is being prepared for shipping.";
        var subject = isAr
            ? $"Soulmate Store - تأكيد الدفع #{Sanitize(orderNumber)}"
            : $"Soulmate Store - Payment Verified #{Sanitize(orderNumber)}";

        var html = BuildSingleLangEmail(title, body, "#22C55E", lang);
        await SendAsync(to, subject, html);
    }

    public async Task SendPaymentRejectedAsync(string to, string orderNumber, string reason, string lang = "ar")
    {
        var isAr = lang == "ar";
        var title = isAr ? "تنبيه بخصوص الدفع ⚠️" : "Payment Notice ⚠️";
        var body = isAr
            ? $"رقم الطلب: <strong>{Sanitize(orderNumber)}</strong><br>السبب: {Sanitize(reason)}<br>يرجى رفع إيصال دفع صحيح."
            : $"Order Number: <strong>{Sanitize(orderNumber)}</strong><br>Reason: {Sanitize(reason)}<br>Please upload a valid payment receipt.";
        var subject = isAr
            ? $"Soulmate Store - رفض الدفع #{Sanitize(orderNumber)}"
            : $"Soulmate Store - Payment Rejected #{Sanitize(orderNumber)}";

        var html = BuildSingleLangEmail(title, body, "#EF4444", lang);
        await SendAsync(to, subject, html);
    }

    public async Task SendOrderShippedAsync(string to, string orderNumber, string lang = "ar")
    {
        var isAr = lang == "ar";
        var title = isAr ? "تم شحن طلبك 🚚" : "Your Order Has Been Shipped 🚚";
        var body = isAr
            ? $"رقم الطلب: <strong>{Sanitize(orderNumber)}</strong><br>طلبك في الطريق إليك!"
            : $"Order Number: <strong>{Sanitize(orderNumber)}</strong><br>Your order is on the way!";
        var subject = isAr
            ? $"Soulmate Store - تم الشحن #{Sanitize(orderNumber)}"
            : $"Soulmate Store - Shipped #{Sanitize(orderNumber)}";

        var html = BuildSingleLangEmail(title, body, "#3B82F6", lang);
        await SendAsync(to, subject, html);
    }

    public async Task SendOrderDeliveredAsync(string to, string orderNumber, string lang = "ar")
    {
        var isAr = lang == "ar";
        var title = isAr ? "تم التسليم بنجاح 🎉" : "Successfully Delivered 🎉";
        var body = isAr
            ? $"رقم الطلب: <strong>{Sanitize(orderNumber)}</strong><br>نتمنى يعجبك الهدية!"
            : $"Order Number: <strong>{Sanitize(orderNumber)}</strong><br>We hope you love your gift!";
        var subject = isAr
            ? $"Soulmate Store - تم التسليم #{Sanitize(orderNumber)}"
            : $"Soulmate Store - Delivered #{Sanitize(orderNumber)}";

        var html = BuildSingleLangEmail(title, body, "#C8A96E", lang);
        await SendAsync(to, subject, html);
    }

    public async Task SendOrderCancelledAutoAsync(string to, string orderNumber, int hoursLimit, string customerName, string lang = "ar")
    {
        var isAr = lang == "ar";
        var title = isAr ? "تم إلغاء طلبك تلقائياً" : "Order Automatically Cancelled";
        var body = isAr
            ? $"مرحباً {Sanitize(customerName)}،<br>تم إلغاء طلبك رقم <strong>{Sanitize(orderNumber)}</strong> تلقائياً بسبب عدم رفع إيصال الدفع خلال {hoursLimit} ساعة.<br>لو حابب تطلب تاني، تقدر تعمل طلب جديد من الموقع."
            : $"Hi {Sanitize(customerName)},<br>Your order <strong>{Sanitize(orderNumber)}</strong> was automatically cancelled because the payment receipt was not uploaded within {hoursLimit} hours.<br>If you'd like to order again, you can place a new order from the website.";
        var subject = isAr
            ? $"Soulmate Store - إلغاء الطلب #{Sanitize(orderNumber)}"
            : $"Soulmate Store - Order Cancelled #{Sanitize(orderNumber)}";

        var html = BuildSingleLangEmail(title, body, "#EF4444", lang);
        await SendAsync(to, subject, html);
    }

    public async Task SendPasswordResetAsync(string to, string resetLink, string lang = "ar")
    {
        var safeLink = Sanitize(resetLink);
        var isAr = lang == "ar";
        var dir = isAr ? "rtl" : "ltr";

        var title = isAr ? "إعادة تعيين كلمة المرور" : "Reset Your Password";
        var instruction = isAr
            ? "اضغط على الزر التالي لإعادة تعيين كلمة المرور:"
            : "Click the button below to reset your password:";
        var btnText = isAr ? "إعادة تعيين كلمة المرور" : "Reset Password";
        var expiry = isAr ? "الرابط صالح لمدة ساعة واحدة فقط." : "This link is valid for one hour only.";
        var ignore = isAr
            ? "لو مطلبتش إعادة تعيين كلمة المرور، تجاهل الإيميل ده."
            : "If you did not request a password reset, please ignore this email.";
        var subject = isAr ? "Soulmate Store - إعادة تعيين كلمة المرور" : "Soulmate Store - Reset Password";

        var html = BuildEmailLayout($@"
            <div dir='{dir}'>
                <h2 style='font-size:20px;color:#1A1A1A;margin:0 0 12px;'>{title}</h2>
                <p style='font-size:14px;color:#6B7280;line-height:1.7;margin:0 0 20px;'>{instruction}</p>
                <a href='{safeLink}' style='display:inline-block;padding:14px 32px;background:#C8A96E;color:#ffffff;text-decoration:none;border-radius:10px;font-weight:600;font-size:14px;'>{btnText}</a>
                <p style='font-size:12px;color:#9CA3AF;margin:16px 0 0;'>{expiry}</p>
                <p style='font-size:12px;color:#9CA3AF;margin:4px 0 0;'>{ignore}</p>
            </div>", dir);
        await SendAsync(to, subject, html);
    }

    private static string BuildSingleLangEmail(string title, string body, string accentColor, string lang)
    {
        var dir = lang == "ar" ? "rtl" : "ltr";
        return BuildEmailLayout($@"
            <div dir='{dir}'>
                <div style='display:inline-block;padding:6px 14px;background:{accentColor}15;border-radius:8px;margin-bottom:16px;'>
                    <span style='font-size:13px;font-weight:600;color:{accentColor};'>{title}</span>
                </div>
                <p style='font-size:15px;color:#374151;line-height:1.8;margin:0;'>{body}</p>
            </div>", dir);
    }

    private static string BuildEmailLayout(string content, string dir = "rtl")
    {
        var langAttr = dir == "rtl" ? "ar" : "en";
        var footerText = dir == "rtl"
            ? "هذه رسالة آلية. يرجى عدم الرد مباشرة."
            : "This is an automated message. Please do not reply directly.";

        return $@"<!DOCTYPE html>
<html lang='{langAttr}' dir='{dir}'>
<head>
    <meta charset='utf-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <meta http-equiv='Content-Type' content='text/html; charset=utf-8'>
    <title>Soulmate Store</title>
</head>
<body style='margin:0;padding:0;background-color:#F3F4F6;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,sans-serif;'>
    <table role='presentation' width='100%' cellpadding='0' cellspacing='0' style='background-color:#F3F4F6;'>
        <tr>
            <td align='center' style='padding:40px 16px;'>
                <table role='presentation' width='600' cellpadding='0' cellspacing='0' style='max-width:600px;width:100%;'>
                    <!-- Header -->
                    <tr>
                        <td align='center' style='padding:0 0 32px;'>
                            <span style='font-size:28px;font-weight:700;color:#1A1A1A;letter-spacing:-0.5px;'>Soulmate</span>
                            <span style='font-size:28px;font-weight:700;color:#C8A96E;letter-spacing:-0.5px;'> Store</span>
                        </td>
                    </tr>
                    <!-- Content Card -->
                    <tr>
                        <td style='background:#ffffff;border-radius:16px;padding:40px 36px;box-shadow:0 1px 3px rgba(0,0,0,0.06);'>
                            {content}
                        </td>
                    </tr>
                    <!-- Footer -->
                    <tr>
                        <td align='center' style='padding:28px 0 0;'>
                            <p style='font-size:12px;color:#9CA3AF;margin:0 0 8px;'>Soulmate Store &copy; {DateTime.UtcNow.Year}</p>
                            <p style='font-size:11px;color:#D1D5DB;margin:0;'>{footerText}</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>";
    }

    private static string HtmlToPlainText(string html)
    {
        var text = System.Text.RegularExpressions.Regex.Replace(html, "<br\\s*/?>", "\n");
        text = System.Text.RegularExpressions.Regex.Replace(text, "<[^>]+>", "");
        text = System.Net.WebUtility.HtmlDecode(text);
        text = System.Text.RegularExpressions.Regex.Replace(text, @"\n{3,}", "\n\n");
        return text.Trim();
    }

    private static string Sanitize(string input)
    {
        return System.Net.WebUtility.HtmlEncode(input);
    }
}
