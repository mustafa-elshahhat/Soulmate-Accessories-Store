using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using SoulmateStore.Data;
using SoulmateStore.Services.Interfaces;

namespace SoulmateStore.Services.Implementations;

public class SeoService : ISeoService
{
    private readonly AppDbContext _db;
    private readonly IConfiguration _configuration;
    private readonly ILogger<SeoService> _logger;

    public SeoService(AppDbContext db, IConfiguration configuration, ILogger<SeoService> logger)
    {
        _db = db;
        _configuration = configuration;
        _logger = logger;
    }

    public async Task<string> GenerateSitemapAsync()
    {
        var frontendUrl = _configuration["FrontendUrl"] ?? "https://soulmate-store.com";

        var sb = new StringBuilder();
        sb.AppendLine("<?xml version=\"1.0\" encoding=\"UTF-8\"?>");
        sb.AppendLine("<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">");

        // Static pages
        string[] staticPages = ["", "products", "builder/select", "about", "privacy", "terms", "return-policy", "contact"];
        foreach (var page in staticPages)
        {
            sb.AppendLine("  <url>");
            sb.AppendLine($"    <loc>{frontendUrl}/{page}</loc>");
            sb.AppendLine("    <changefreq>weekly</changefreq>");
            sb.AppendLine($"    <priority>{(page == "" ? "1.0" : "0.8")}</priority>");
            sb.AppendLine("  </url>");
        }

        // Active products
        var products = await _db.Products
            .AsNoTracking()
            .Where(p => p.IsActive)
            .Select(p => new { p.Slug, p.UpdatedAt })
            .ToListAsync();

        foreach (var product in products)
        {
            sb.AppendLine("  <url>");
            sb.AppendLine($"    <loc>{frontendUrl}/products/{product.Slug}</loc>");
            sb.AppendLine($"    <lastmod>{product.UpdatedAt:yyyy-MM-dd}</lastmod>");
            sb.AppendLine("    <changefreq>daily</changefreq>");
            sb.AppendLine("    <priority>0.9</priority>");
            sb.AppendLine("  </url>");
        }

        // Active box types
        var boxTypes = await _db.BoxTypes
            .AsNoTracking()
            .Where(bt => bt.IsActive)
            .Select(bt => new { bt.Slug, bt.UpdatedAt })
            .ToListAsync();

        foreach (var bt in boxTypes)
        {
            sb.AppendLine("  <url>");
            sb.AppendLine($"    <loc>{frontendUrl}/builder/select</loc>");
            sb.AppendLine($"    <lastmod>{bt.UpdatedAt:yyyy-MM-dd}</lastmod>");
            sb.AppendLine("    <changefreq>weekly</changefreq>");
            sb.AppendLine("    <priority>0.8</priority>");
            sb.AppendLine("  </url>");
        }

        sb.AppendLine("</urlset>");

        _logger.LogInformation("Sitemap generated with {ProductCount} products and {BoxTypeCount} box types", products.Count, boxTypes.Count);

        return sb.ToString();
    }
}
