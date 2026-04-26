using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SoulmateStore.DTOs.Common;
using SoulmateStore.DTOs.Reviews;
using SoulmateStore.Services.Interfaces;

namespace SoulmateStore.Controllers;

[ApiController]
[Route("api/reviews")]
public class ReviewsController : ControllerBase
{
    private readonly IReviewService _reviews;

    public ReviewsController(IReviewService reviews)
    {
        _reviews = reviews;
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

    [HttpGet("product/{productId:guid}")]
    public async Task<IActionResult> GetByProduct(Guid productId, [FromQuery] int page = 1, [FromQuery] int limit = 20)
    {
        var result = await _reviews.GetByProductAsync(productId, page, limit);
        return Ok(new ApiResponse<ProductReviewsSummaryDto> { Data = result });
    }

    [HttpPost]
    [Authorize]
    public async Task<IActionResult> Create([FromBody] CreateReviewDto dto)
    {
        var result = await _reviews.CreateAsync(dto, UserId);
        return Ok(new ApiResponse<ReviewResponseDto> { Data = result });
    }

    [HttpPut("{id:guid}")]
    [Authorize]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateReviewDto dto)
    {
        var result = await _reviews.UpdateAsync(id, dto, UserId);
        return Ok(new ApiResponse<ReviewResponseDto> { Data = result });
    }

    [HttpDelete("{id:guid}")]
    [Authorize]
    public async Task<IActionResult> Delete(Guid id)
    {
        await _reviews.DeleteAsync(id, UserId);
        return Ok(new ApiResponse<object> { Data = null });
    }
}
