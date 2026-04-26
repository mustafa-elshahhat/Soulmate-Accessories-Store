using Microsoft.AspNetCore.Mvc;
using SoulmateStore.DTOs.Common;
using SoulmateStore.Services.Interfaces;

namespace SoulmateStore.Controllers;

[ApiController]
[Route("api/internal")]
public class InternalController : ControllerBase
{
    private readonly IInternalService _internalService;

    public InternalController(IInternalService internalService)
    {
        _internalService = internalService;
    }

    [HttpGet("kv/{key}")]
    public async Task<IActionResult> Get(string key)
    {
        _internalService.ValidateKey(Request.Headers["X-Internal-Key"].FirstOrDefault());
        var value = await _internalService.GetSettingAsync(key);
        return Ok(new { value });
    }

    [HttpPut("kv/{key}")]
    [RequestSizeLimit(1 * 1024 * 1024)]
    public async Task<IActionResult> Set(string key, [FromBody] KvDto dto)
    {
        _internalService.ValidateKey(Request.Headers["X-Internal-Key"].FirstOrDefault());
        await _internalService.SetSettingAsync(key, dto.Value);
        return Ok();
    }
}
