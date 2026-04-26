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
public class DashboardController : ControllerBase
{
    private readonly IAdminService _admin;

    public DashboardController(IAdminService admin)
    {
        _admin = admin;
    }

    [HttpGet("dashboard")]
    public async Task<IActionResult> Dashboard()
    {
        var data = await _admin.GetDashboardAsync();
        return Ok(new ApiResponse<DashboardDto> { Data = data });
    }

    [HttpGet("analytics")]
    public async Task<IActionResult> Analytics()
    {
        var data = await _admin.GetAnalyticsAsync();
        return Ok(new ApiResponse<AnalyticsDto> { Data = data });
    }

    [HttpGet("users")]
    public async Task<IActionResult> GetUsers([FromQuery] int page = 1, [FromQuery] int limit = 20)
    {
        var result = await _admin.GetUsersAsync(page, limit);
        return Ok(result);
    }
}
