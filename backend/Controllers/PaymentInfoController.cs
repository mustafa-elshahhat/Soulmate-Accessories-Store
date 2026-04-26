using Microsoft.AspNetCore.Mvc;
using SoulmateStore.DTOs.Common;
using SoulmateStore.DTOs.Payments;
using SoulmateStore.Services.Interfaces;

namespace SoulmateStore.Controllers;

/// <summary>
/// Public endpoint for payment info (no auth required).
/// Spec: GET /api/payment-info
/// </summary>
[ApiController]
[Route("api/payment-info")]
public class PaymentInfoController : ControllerBase
{
    private readonly IPaymentService _payments;

    public PaymentInfoController(IPaymentService payments)
    {
        _payments = payments;
    }

    [HttpGet]
    public async Task<IActionResult> GetPaymentInfo()
    {
        var result = await _payments.GetPaymentInfoAsync();
        return Ok(new ApiResponse<PaymentInfoDto> { Success = true, Data = result });
    }
}
