using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using SoulmateStore.DTOs.Admin;
using SoulmateStore.DTOs.BoxReviews;
using SoulmateStore.DTOs.Common;
using SoulmateStore.Services.Interfaces;

namespace SoulmateStore.Controllers.Admin;

[ApiController]
[Route("api/admin")]
[Authorize(Roles = "admin")]
[EnableRateLimiting("Admin")]
public class AdminReviewsController : ControllerBase
{
    private readonly IBoxReviewService _boxReviews;
    private readonly IAdminService _admin;

    public AdminReviewsController(IBoxReviewService boxReviews, IAdminService admin)
    {
        _boxReviews = boxReviews;
        _admin = admin;
    }

    [HttpGet("box-reviews")]
    public async Task<IActionResult> GetBoxReviews()
    {
        var data = await _boxReviews.GetAllAdminAsync();
        return Ok(new ApiResponse<List<BoxReviewResponseDto>> { Data = data });
    }

    [HttpDelete("box-reviews/{id:guid}")]
    public async Task<IActionResult> DeleteBoxReview(Guid id)
    {
        await _boxReviews.AdminDeleteAsync(id);
        return Ok(new ApiResponse<object> { Message = "تم حذف التقييم" });
    }

    [HttpGet("customization-prices")]
    public async Task<IActionResult> GetCustomizationPrices()
    {
        var data = await _admin.GetCustomizationPricesAsync();
        return Ok(new ApiResponse<List<CategoryCustomizationPriceDto>> { Data = data });
    }

    [HttpPost("customization-prices")]
    public async Task<IActionResult> UpsertCustomizationPrice([FromBody] UpsertCustomizationPriceDto dto)
    {
        await _admin.UpsertCustomizationPriceAsync(dto);
        return Ok(new ApiResponse<object> { Message = "تم تحديث سعر التخصيص" });
    }

    [HttpDelete("customization-prices/{id:guid}")]
    public async Task<IActionResult> DeleteCustomizationPrice(Guid id)
    {
        await _admin.DeleteCustomizationPriceAsync(id);
        return Ok(new ApiResponse<object> { Message = "تم حذف سعر التخصيص" });
    }
}
