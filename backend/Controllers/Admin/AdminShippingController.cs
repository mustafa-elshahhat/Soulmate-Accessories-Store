using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using SoulmateStore.DTOs.Common;
using SoulmateStore.Services.Interfaces;

namespace SoulmateStore.Controllers.Admin;

[ApiController]
[Route("api/admin/governorates")]
[Authorize(Roles = "admin")]
[EnableRateLimiting("Admin")]
public class AdminShippingController : ControllerBase
{
    private readonly IGovernorateService _governorates;

    public AdminShippingController(IGovernorateService governorates)
    {
        _governorates = governorates;
    }

    [HttpGet]
    public async Task<IActionResult> GetGovernorates()
    {
        var data = await _governorates.GetAllAsync();
        return Ok(new ApiResponse<List<GovernorateDto>> { Data = data });
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> UpdateGovernorate(Guid id, [FromBody] UpdateGovernorateDto dto)
    {
        var data = await _governorates.UpdateAsync(id, dto);
        return Ok(new ApiResponse<GovernorateDto> { Data = data, Message = "تم تحديث المحافظة" });
    }
}
