using Microsoft.AspNetCore.Mvc;
using SoulmateStore.DTOs.Common;
using SoulmateStore.Services.Interfaces;

namespace SoulmateStore.Controllers;

[ApiController]
[Route("api/internal")]
public class InternalController : ControllerBase
{
    private readonly IInternalService _internalService;
    private readonly ILogger<InternalController> _logger;

    public InternalController(IInternalService internalService, ILogger<InternalController> logger)
    {
        _internalService = internalService;
        _logger = logger;
    }

    [HttpGet("kv/{key}")]
    public async Task<IActionResult> Get(string key)
    {
        _internalService.ValidateKey(Request.Headers["X-Internal-Key"].FirstOrDefault());
        _logger.LogInformation("Internal KV get requested for key '{Key}' from {RemoteIp}", key, HttpContext.Connection.RemoteIpAddress);

        try
        {
            var value = await _internalService.GetSettingAsync(key);
            var sizeKb = value?.Length > 0 ? value.Length / 1024 : 0;
            _logger.LogInformation("Internal KV get succeeded for key '{Key}' ({SizeKb}KB)", key, sizeKb);
            return Ok(new { value });
        }
        catch (SoulmateStore.Exceptions.NotFoundException)
        {
            _logger.LogInformation("Internal KV get returned 404 for key '{Key}'", key);
            throw;
        }
    }

    [HttpPut("kv/{key}")]
    public async Task<IActionResult> Set(string key, [FromBody] KvDto dto)
    {
        _internalService.ValidateKey(Request.Headers["X-Internal-Key"].FirstOrDefault());
        var sizeKb = dto.Value?.Length > 0 ? dto.Value.Length / 1024 : 0;
        _logger.LogInformation("Internal KV put requested for key '{Key}' ({SizeKb}KB) from {RemoteIp}", key, sizeKb, HttpContext.Connection.RemoteIpAddress);

        await _internalService.SetSettingAsync(key, dto.Value);
        _logger.LogInformation("Internal KV put succeeded for key '{Key}'", key);
        return Ok();
    }
}
