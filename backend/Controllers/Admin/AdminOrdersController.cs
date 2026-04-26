using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using SoulmateStore.DTOs.Admin;
using SoulmateStore.DTOs.Common;
using SoulmateStore.Services.Interfaces;

namespace SoulmateStore.Controllers.Admin;

[ApiController]
[Route("api/admin")]
[Authorize(Roles = "admin")]
[EnableRateLimiting("Admin")]
public class AdminOrdersController : ControllerBase
{
    private readonly IAdminService _admin;
    private readonly IOrderService _orders;
    private readonly IPaymentService _payments;

    public AdminOrdersController(IAdminService admin, IOrderService orders, IPaymentService payments)
    {
        _admin = admin;
        _orders = orders;
        _payments = payments;
    }

    [HttpGet("orders")]
    public async Task<IActionResult> GetOrders(
        [FromQuery] int page = 1,
        [FromQuery] int limit = 20,
        [FromQuery] string? status = null,
        [FromQuery] string? search = null)
    {
        var result = await _admin.GetOrdersAsync(page, limit, status, search);
        return Ok(result);
    }

    [HttpGet("orders/{id:guid}")]
    public async Task<IActionResult> GetOrder(Guid id)
    {
        var data = await _admin.GetOrderByIdAsync(id);
        return Ok(new ApiResponse<AdminOrderDetailDto> { Data = data });
    }

    [HttpPut("orders/{id:guid}/status")]
    public async Task<IActionResult> UpdateOrderStatus(Guid id, [FromBody] UpdateOrderStatusDto dto)
    {
        await _orders.UpdateStatusAsync(id, dto.Status, dto.AdminNote);
        return Ok(new ApiResponse<object> { Message = "تم تحديث حالة الطلب" });
    }

    [HttpPost("payments/{paymentId:guid}/verify")]
    public async Task<IActionResult> VerifyPayment(Guid paymentId, [FromBody] PaymentActionDto dto)
    {
        if (dto.Action == "verify")
            await _payments.VerifyAsync(paymentId, dto.AdminNote);
        else if (dto.Action == "reject")
            await _payments.RejectAsync(paymentId, dto.AdminNote ?? "تم الرفض");
        else
            return BadRequest(new ApiErrorResponse { ErrorCode = "INVALID_ACTION", Message = "الإجراء مش صحيح", StatusCode = 400 });

        return Ok(new ApiResponse<object> { Message = "تم تحديث حالة الدفع" });
    }
}
