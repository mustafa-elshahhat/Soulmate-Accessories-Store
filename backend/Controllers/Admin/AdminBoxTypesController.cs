using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OutputCaching;
using Microsoft.AspNetCore.RateLimiting;
using SoulmateStore.DTOs.Admin;
using SoulmateStore.DTOs.Common;
using SoulmateStore.Services.Interfaces;

namespace SoulmateStore.Controllers.Admin;

[ApiController]
[Route("api/admin/box-types")]
[Authorize(Roles = "admin")]
[EnableRateLimiting("Admin")]
public class AdminBoxTypesController : ControllerBase
{
    private readonly IAdminService _admin;
    private readonly IOutputCacheStore _cache;

    public AdminBoxTypesController(IAdminService admin, IOutputCacheStore cache)
    {
        _admin = admin;
        _cache = cache;
    }

    [HttpGet]
    public async Task<IActionResult> GetBoxTypes()
    {
        var data = await _admin.GetBoxTypesAsync();
        return Ok(new ApiResponse<List<AdminBoxTypeListDto>> { Data = data });
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetBoxType(Guid id)
    {
        var data = await _admin.GetBoxTypeByIdAsync(id);
        return Ok(new ApiResponse<AdminBoxTypeDetailDto> { Data = data });
    }

    [HttpPost]
    public async Task<IActionResult> CreateBoxType([FromBody] CreateBoxTypeDto dto)
    {
        var boxTypeId = await _admin.CreateBoxTypeAsync(dto);
        await _cache.EvictByTagAsync("boxtypes", default);
        return CreatedAtAction(nameof(GetBoxType), new { id = boxTypeId },
            new ApiResponse<object> { Data = new { Id = boxTypeId } });
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> UpdateBoxType(Guid id, [FromBody] CreateBoxTypeDto dto)
    {
        await _admin.UpdateBoxTypeAsync(id, dto);
        await _cache.EvictByTagAsync("boxtypes", default);
        return Ok(new ApiResponse<object> { Message = "تم تحديث نوع البوكس" });
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteBoxType(Guid id)
    {
        await _admin.DeleteBoxTypeAsync(id);
        return Ok(new ApiResponse<object> { Message = "تم حذف نوع البوكس" });
    }

    [HttpPost("{id:guid}/slots")]
    public async Task<IActionResult> CreateSlot(Guid id, [FromBody] CreateSlotDto dto)
    {
        var slotId = await _admin.CreateSlotAsync(id, dto);
        return CreatedAtAction(nameof(GetBoxType), new { id },
            new ApiResponse<object> { Data = new { Id = slotId } });
    }

    [HttpPut("{id:guid}/slots/{slotId:guid}")]
    public async Task<IActionResult> UpdateSlot(Guid id, Guid slotId, [FromBody] CreateSlotDto dto)
    {
        await _admin.UpdateSlotAsync(id, slotId, dto);
        return Ok(new ApiResponse<object> { Message = "تم تحديث الـ Slot" });
    }

    [HttpDelete("{id:guid}/slots/{slotId:guid}")]
    public async Task<IActionResult> DeleteSlot(Guid id, Guid slotId)
    {
        await _admin.DeleteSlotAsync(id, slotId);
        return Ok(new ApiResponse<object> { Message = "تم حذف الـ Slot" });
    }
}
