using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SoulmateStore.DTOs.Common;
using SoulmateStore.DTOs.Coupons;
using SoulmateStore.Services.Interfaces;

namespace SoulmateStore.Controllers;

[ApiController]
[Route("api/coupons")]
public class CouponsController : ControllerBase
{
    private readonly ICouponService _coupons;

    public CouponsController(ICouponService coupons)
    {
        _coupons = coupons;
    }

    [HttpPost("validate")]
    [Authorize]
    public async Task<IActionResult> Validate([FromBody] ValidateCouponDto dto)
    {
        var result = await _coupons.ValidateAsync(dto.Code, dto.OrderTotal);
        return Ok(new ApiResponse<CouponValidationResultDto> { Data = result });
    }
}
