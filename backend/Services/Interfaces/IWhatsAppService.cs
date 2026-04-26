namespace SoulmateStore.Services.Interfaces;

public interface IWhatsAppService
{
    Task SendOrderCreatedAsync(string phone, string customerName, string orderNumber, Guid orderId, string lang = "ar");
    Task SendPaymentVerifiedAsync(string phone, string customerName, string orderNumber, Guid orderId, string lang = "ar");
    Task SendPaymentRejectedAsync(string phone, string customerName, string orderNumber, Guid orderId, string reason, string lang = "ar");
    Task SendOrderShippedAsync(string phone, string customerName, string orderNumber, Guid orderId, string lang = "ar");
    Task SendOrderDeliveredAsync(string phone, string customerName, string orderNumber, Guid orderId, string lang = "ar");
    Task SendOrderCancelledAsync(string phone, string customerName, string orderNumber, Guid orderId, string lang = "ar");
}
