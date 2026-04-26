using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SoulmateStore.DTOs.BoxReviews;
using SoulmateStore.DTOs.Common;
using SoulmateStore.Services.Interfaces;

namespace SoulmateStore.Controllers;

[ApiController]
[Route("api/box-reviews")]
public class BoxReviewsController : ControllerBase
{
    private readonly IBoxReviewService _boxReviews;

    public BoxReviewsController(IBoxReviewService boxReviews)
    {
        _boxReviews = boxReviews;
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

    [HttpGet("box-type/{boxTypeId:guid}")]
    public async Task<IActionResult> GetByBoxType(Guid boxTypeId, [FromQuery] int page = 1, [FromQuery] int limit = 20)
    {
        var result = await _boxReviews.GetByBoxTypeAsync(boxTypeId, page, limit);
        return Ok(new ApiResponse<BoxReviewsSummaryDto> { Data = result });
    }

    [HttpPost]
    [Authorize]
    public async Task<IActionResult> Create([FromBody] CreateBoxReviewDto dto)
    {
        var result = await _boxReviews.CreateAsync(dto, UserId);
        return Ok(new ApiResponse<BoxReviewResponseDto> { Data = result });
    }

    [HttpDelete("{id:guid}")]
    [Authorize]
    public async Task<IActionResult> Delete(Guid id)
    {
        await _boxReviews.DeleteAsync(id, UserId);
        return Ok(new ApiResponse<object> { Data = null });
    }
}
