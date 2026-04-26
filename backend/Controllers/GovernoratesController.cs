using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OutputCaching;
using Microsoft.AspNetCore.RateLimiting;
using SoulmateStore.DTOs.Common;
using SoulmateStore.Services.Interfaces;

namespace SoulmateStore.Controllers;

[ApiController]
[Route("api/governorates")]
[EnableRateLimiting("General")]
public class GovernoratesController : ControllerBase
{
    private readonly IGovernorateService _governorates;

    public GovernoratesController(IGovernorateService governorates)
    {
        _governorates = governorates;
    }

    [HttpGet]
    [OutputCache(Duration = 300)]
    public async Task<IActionResult> GetAll()
    {
        var data = await _governorates.GetActiveAsync();
        return Ok(new ApiResponse<List<GovernorateDto>> { Data = data });
    }
}
