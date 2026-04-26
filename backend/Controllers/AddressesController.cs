using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SoulmateStore.DTOs.Addresses;
using SoulmateStore.DTOs.Common;
using SoulmateStore.Services.Interfaces;

namespace SoulmateStore.Controllers;

[ApiController]
[Route("api/addresses")]
[Authorize]
public class AddressesController : ControllerBase
{
    private readonly IAddressService _addresses;

    public AddressesController(IAddressService addresses)
    {
        _addresses = addresses;
    }

    private Guid UserId => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var addresses = await _addresses.GetByUserAsync(UserId);
        return Ok(new ApiResponse<List<AddressResponseDto>> { Success = true, Data = addresses });
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateAddressDto dto)
    {
        var address = await _addresses.CreateAsync(UserId, dto);
        return Ok(new ApiResponse<AddressResponseDto> { Success = true, Data = address });
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] CreateAddressDto dto)
    {
        var address = await _addresses.UpdateAsync(id, UserId, dto);
        return Ok(new ApiResponse<AddressResponseDto> { Success = true, Data = address });
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        await _addresses.DeleteAsync(id, UserId);
        return Ok(new ApiResponse<object> { Message = "تم حذف العنوان" });
    }
}
