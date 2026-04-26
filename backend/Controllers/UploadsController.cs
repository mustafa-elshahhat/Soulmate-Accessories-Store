using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using SoulmateStore.DTOs.Common;
using SoulmateStore.Services.Interfaces;

namespace SoulmateStore.Controllers;

[ApiController]
[Route("api/admin/uploads")]
[Authorize(Roles = "admin")]
[EnableRateLimiting("Upload")]
public class UploadsController : ControllerBase
{
    private readonly IUploadService _upload;

    public UploadsController(IUploadService upload)
    {
        _upload = upload;
    }

    [HttpPost("product-image")]
    [RequestSizeLimit(5 * 1024 * 1024)]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> UploadProductImage(IFormFile image)
    {
        var url = await _upload.UploadImageAsync(image);
        return Ok(new ApiResponse<object> { Data = new { url } });
    }

    [HttpPost("box-image")]
    [RequestSizeLimit(5 * 1024 * 1024)]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> UploadBoxImage(IFormFile image)
    {
        var url = await _upload.UploadImageAsync(image);
        return Ok(new ApiResponse<object> { Data = new { url } });
    }
}
