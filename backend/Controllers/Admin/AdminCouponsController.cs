using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using SoulmateStore.DTOs.Common;
using SoulmateStore.DTOs.Coupons;
using SoulmateStore.Services.Interfaces;

namespace SoulmateStore.Controllers.Admin;

[ApiController]
[Route("api/admin/coupons")]
[Authorize(Roles = "admin")]
[EnableRateLimiting("Admin")]
public class AdminCouponsController : ControllerBase
{
    private readonly ICouponService _coupons;

    public AdminCouponsController(ICouponService coupons)
    {
        _coupons = coupons;
    }

    [HttpGet]
    public async Task<IActionResult> GetCoupons()
    {
        var data = await _coupons.GetAllAsync();
        return Ok(new ApiResponse<List<CouponResponseDto>> { Data = data });
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetCoupon(Guid id)
    {
        var data = await _coupons.GetByIdAsync(id);
        return Ok(new ApiResponse<CouponResponseDto> { Data = data });
    }

    [HttpPost]
    public async Task<IActionResult> CreateCoupon([FromBody] CreateCouponDto dto)
    {
        var data = await _coupons.CreateAsync(dto);
        return CreatedAtAction(nameof(GetCoupon), new { id = data.Id },
            new ApiResponse<CouponResponseDto> { Data = data });
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> UpdateCoupon(Guid id, [FromBody] UpdateCouponDto dto)
    {
        var data = await _coupons.UpdateAsync(id, dto);
        return Ok(new ApiResponse<CouponResponseDto> { Data = data });
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteCoupon(Guid id)
    {
        await _coupons.DeleteAsync(id);
        return Ok(new ApiResponse<object> { Message = "تم حذف الكوبون" });
    }
}
