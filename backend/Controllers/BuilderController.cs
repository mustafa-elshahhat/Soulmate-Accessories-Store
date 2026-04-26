using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OutputCaching;
using SoulmateStore.DTOs.Builder;
using SoulmateStore.DTOs.Common;
using SoulmateStore.Services.Interfaces;

namespace SoulmateStore.Controllers;

[ApiController]
[Route("api/builder")]
public class BuilderController : ControllerBase
{
    private readonly IBuilderService _builderService;

    public BuilderController(IBuilderService builderService)
    {
        _builderService = builderService;
    }

    [HttpGet("box-types")]
    [OutputCache(PolicyName = "BoxTypes")]
    public async Task<ActionResult<ApiResponse<List<BoxTypeDto>>>> GetBoxTypes()
    {
        var boxTypes = await _builderService.GetBoxTypesAsync();
        return Ok(new ApiResponse<List<BoxTypeDto>> { Data = boxTypes });
    }

    [HttpGet("box-types/{id:guid}/slots")]
    [OutputCache(PolicyName = "BoxTypes")]
    public async Task<ActionResult<ApiResponse<List<BoxSlotDto>>>> GetSlots(Guid id)
    {
        var slots = await _builderService.GetSlotsAsync(id);
        return Ok(new ApiResponse<List<BoxSlotDto>> { Data = slots });
    }

    [HttpGet("slots/{slotId:guid}/products")]
    [OutputCache(PolicyName = "Products")]
    public async Task<ActionResult<ApiResponse<List<SlotProductDto>>>> GetProductsForSlot(Guid slotId)
    {
        var products = await _builderService.GetProductsForSlotByIdAsync(slotId);
        return Ok(new ApiResponse<List<SlotProductDto>> { Data = products });
    }

    [HttpPost("preview")]
    public async Task<ActionResult<ApiResponse<PreviewResponseDto>>> Preview([FromBody] PreviewRequestDto dto)
    {
        var result = await _builderService.PreviewAsync(dto);
        return Ok(new ApiResponse<PreviewResponseDto> { Data = result });
    }
}
