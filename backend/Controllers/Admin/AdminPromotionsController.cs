using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OutputCaching;
using Microsoft.AspNetCore.RateLimiting;
using SoulmateStore.DTOs.Common;
using SoulmateStore.DTOs.Promotions;
using SoulmateStore.Services.Interfaces;

namespace SoulmateStore.Controllers.Admin;

[ApiController]
[Route("api/admin/promotions")]
[Authorize(Roles = "admin")]
[EnableRateLimiting("Admin")]
public class AdminPromotionsController : ControllerBase
{
    private readonly IPromotionService _promotions;
    private readonly IOutputCacheStore _cache;

    public AdminPromotionsController(IPromotionService promotions, IOutputCacheStore cache)
    {
        _promotions = promotions;
        _cache = cache;
    }

    [HttpGet]
    public async Task<IActionResult> GetPromotions()
    {
        var data = await _promotions.GetAllAsync();
        return Ok(new ApiResponse<List<PromotionResponseDto>> { Data = data });
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetPromotion(Guid id)
    {
        var data = await _promotions.GetByIdAsync(id);
        return Ok(new ApiResponse<PromotionResponseDto> { Data = data });
    }

    [HttpPost]
    public async Task<IActionResult> CreatePromotion([FromBody] CreatePromotionDto dto)
    {
        var data = await _promotions.CreateAsync(dto);
        await _cache.EvictByTagAsync("products", default);
        return CreatedAtAction(nameof(GetPromotion), new { id = data.Id },
            new ApiResponse<PromotionResponseDto> { Data = data });
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> UpdatePromotion(Guid id, [FromBody] UpdatePromotionDto dto)
    {
        var data = await _promotions.UpdateAsync(id, dto);
        await _cache.EvictByTagAsync("products", default);
        return Ok(new ApiResponse<PromotionResponseDto> { Data = data });
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeletePromotion(Guid id)
    {
        await _promotions.DeleteAsync(id);
        await _cache.EvictByTagAsync("products", default);
        return Ok(new ApiResponse<object> { Message = "تم حذف العرض" });
    }
}
