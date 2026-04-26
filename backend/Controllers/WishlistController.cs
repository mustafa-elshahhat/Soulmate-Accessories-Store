using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SoulmateStore.DTOs.Common;
using SoulmateStore.DTOs.Wishlist;
using SoulmateStore.Services.Interfaces;

namespace SoulmateStore.Controllers;

[ApiController]
[Route("api/wishlist")]
[Authorize]
public class WishlistController : ControllerBase
{
    private readonly IWishlistService _wishlist;

    public WishlistController(IWishlistService wishlist)
    {
        _wishlist = wishlist;
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

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var items = await _wishlist.GetByUserAsync(UserId);
        return Ok(new ApiResponse<List<WishlistItemDto>> { Data = items });
    }

    [HttpGet("ids")]
    public async Task<IActionResult> GetIds()
    {
        var ids = await _wishlist.GetProductIdsByUserAsync(UserId);
        return Ok(new ApiResponse<List<Guid>> { Data = ids });
    }

    [HttpPost("{productId:guid}")]
    public async Task<IActionResult> Add(Guid productId)
    {
        await _wishlist.AddAsync(UserId, productId);
        return Ok(new ApiResponse<object> { Message = "تم الإضافة للمفضلة" });
    }

    [HttpDelete("{productId:guid}")]
    public async Task<IActionResult> Remove(Guid productId)
    {
        await _wishlist.RemoveAsync(UserId, productId);
        return Ok(new ApiResponse<object> { Message = "تم الإزالة من المفضلة" });
    }
}
