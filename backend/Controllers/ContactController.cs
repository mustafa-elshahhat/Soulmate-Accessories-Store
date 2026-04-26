using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using SoulmateStore.DTOs.Common;
using SoulmateStore.Helpers;
using SoulmateStore.Services.Interfaces;

namespace SoulmateStore.Controllers;

[ApiController]
[Route("api/contact")]
public class ContactController : ControllerBase
{
    private readonly IEmailService _emailService;

    public ContactController(IEmailService emailService)
    {
        _emailService = emailService;
    }

    [HttpPost]
    [EnableRateLimiting("contact")]
    public async Task<ActionResult<ApiResponse<string>>> SendContact([FromBody] ContactDto dto)
    {
        await _emailService.SendContactAsync(
            InputSanitizer.StripHtml(dto.Name),
            dto.Email,
            InputSanitizer.StripHtml(dto.Message));
        return Ok(new ApiResponse<string> { Data = "sent", Message = "Message sent successfully" });
    }
}
