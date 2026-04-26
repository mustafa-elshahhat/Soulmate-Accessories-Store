namespace SoulmateStore.Services.Interfaces;

public interface IEmailService
{
    Task SendAsync(string to, string subject, string htmlBody);
    Task SendContactAsync(string name, string email, string message);
    Task SendOrderCreatedAsync(string to, string orderNumber, string lang = "ar");
    Task SendPaymentVerifiedAsync(string to, string orderNumber, string lang = "ar");
    Task SendPaymentRejectedAsync(string to, string orderNumber, string reason, string lang = "ar");
    Task SendOrderShippedAsync(string to, string orderNumber, string lang = "ar");
    Task SendOrderDeliveredAsync(string to, string orderNumber, string lang = "ar");
    Task SendOrderCancelledAutoAsync(string to, string orderNumber, int hoursLimit, string customerName, string lang = "ar");
    Task SendPasswordResetAsync(string to, string resetLink, string lang = "ar");
}
