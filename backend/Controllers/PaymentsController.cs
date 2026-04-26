using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SoulmateStore.DTOs.Common;
using SoulmateStore.DTOs.Payments;
using SoulmateStore.Models.Enums;
using SoulmateStore.Services.Interfaces;

namespace SoulmateStore.Controllers;

[ApiController]
[Route("api/payments")]
[Authorize]
public class PaymentsController : ControllerBase
{
    private readonly IPaymentService _payments;

    public PaymentsController(IPaymentService payments)
    {
        _payments = payments;
    }

    private Guid UserId => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet("{orderId:guid}")]
    public async Task<IActionResult> GetByOrder(Guid orderId)
    {
        var result = await _payments.GetByOrderAsync(orderId, UserId);
        return Ok(new ApiResponse<PaymentResponseDto?> { Success = true, Data = result });
    }

    [HttpPost("{orderId:guid}/upload")]
    [RequestSizeLimit(5 * 1024 * 1024)]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> Upload(Guid orderId, IFormFile screenshot, [FromForm] string method)
    {
        if (!Enum.TryParse<PaymentMethod>(method.Replace("_", ""), true, out var paymentMethod))
            return BadRequest(new ApiErrorResponse { Message = "طريقة الدفع مش صحيحة. الطرق المتاحة: vodafone_cash, instapay", ErrorCode = "INVALID_PAYMENT_METHOD", StatusCode = 400 });

        var result = await _payments.UploadReceiptAsync(orderId, UserId, paymentMethod, screenshot);
        return Ok(new ApiResponse<PaymentResponseDto> { Success = true, Data = result });
    }
}
