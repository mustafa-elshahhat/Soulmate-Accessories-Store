using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SoulmateStore.DTOs.Common;
using SoulmateStore.DTOs.Orders;
using SoulmateStore.Services.Interfaces;

namespace SoulmateStore.Controllers;

[ApiController]
[Route("api/orders")]
[Authorize]
public class OrdersController : ControllerBase
{
    private readonly IOrderService _orders;

    public OrdersController(IOrderService orders)
    {
        _orders = orders;
    }

    private Guid UserId
    {
        get
        {
            var claim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(claim))
                throw new Exceptions.UnauthorizedException("INVALID_TOKEN", "User ID claim not found in token");
            return Guid.Parse(claim);
        }
    }

    [HttpPost("preview")]
    public async Task<IActionResult> Preview([FromBody] CreateOrderDto dto)
    {
        var result = await _orders.PreviewAsync(dto, UserId);
        return Ok(new ApiResponse<OrderPreviewDto> { Success = true, Data = result });
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateOrderDto dto)
    {
        var result = await _orders.CreateAsync(dto, UserId);
        return Ok(new ApiResponse<OrderResponseDto> { Success = true, Data = result });
    }

    [HttpGet]
    public async Task<IActionResult> GetMyOrders([FromQuery] int page = 1, [FromQuery] int limit = 10)
    {
        var result = await _orders.GetMyOrdersAsync(UserId, page, limit);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var result = await _orders.GetByIdAsync(id, UserId);
        return Ok(new ApiResponse<OrderResponseDto> { Success = true, Data = result });
    }

    [HttpPut("{id:guid}/cancel")]
    public async Task<IActionResult> Cancel(Guid id)
    {
        await _orders.CancelAsync(id, UserId);
        return Ok(new ApiResponse<object> { Success = true, Message = "تم إلغاء الطلب" });
    }
}
