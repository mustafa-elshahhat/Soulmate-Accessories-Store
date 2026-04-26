using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SoulmateStore.DTOs.Common;
using SoulmateStore.DTOs.Cart;
using SoulmateStore.Services.Interfaces;

namespace SoulmateStore.Controllers;

[ApiController]
[Route("api/cart")]
[Authorize]
public class CartController : ControllerBase
{
    private readonly ICartService _cartService;

    public CartController(ICartService cartService)
    {
        _cartService = cartService;
    }

    private Guid UserId => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet]
    public async Task<ActionResult<ApiResponse<CartResponseDto>>> Get()
    {
        var cart = await _cartService.GetAsync(UserId);
        return Ok(new ApiResponse<CartResponseDto> { Data = cart });
    }

    [HttpPut]
    public async Task<ActionResult<ApiResponse<CartResponseDto>>> Save([FromBody] SaveCartDto dto)
    {
        var cart = await _cartService.SaveAsync(UserId, dto);
        return Ok(new ApiResponse<CartResponseDto> { Data = cart });
    }

    [HttpDelete]
    public async Task<ActionResult<ApiResponse<object>>> Clear()
    {
        await _cartService.ClearAsync(UserId);
        return Ok(new ApiResponse<object> { Message = "تم مسح السلة" });
    }
}
