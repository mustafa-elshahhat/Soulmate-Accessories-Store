using SoulmateStore.DTOs.Payments;
using SoulmateStore.Models.Enums;

namespace SoulmateStore.Services.Interfaces;

public interface IPaymentService
{
    Task<PaymentResponseDto> UploadReceiptAsync(Guid orderId, Guid userId, PaymentMethod method, IFormFile screenshot);
    Task<PaymentResponseDto?> GetByOrderAsync(Guid orderId, Guid userId);
    Task VerifyAsync(Guid paymentId, string? adminNote);
    Task RejectAsync(Guid paymentId, string reason);
    Task<PaymentInfoDto> GetPaymentInfoAsync();
}
