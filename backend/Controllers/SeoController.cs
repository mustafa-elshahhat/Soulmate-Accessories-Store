using System.Text;
using Microsoft.AspNetCore.Mvc;
using SoulmateStore.Services.Interfaces;

namespace SoulmateStore.Controllers;

[ApiController]
[Route("api/seo")]
public class SeoController : ControllerBase
{
    private readonly ISeoService _seoService;

    public SeoController(ISeoService seoService)
    {
        _seoService = seoService;
    }

    [HttpGet("sitemap.xml")]
    [ResponseCache(Duration = 600)]
    public async Task<IActionResult> Sitemap()
    {
        var xml = await _seoService.GenerateSitemapAsync();
        return Content(xml, "application/xml", Encoding.UTF8);
    }
}
