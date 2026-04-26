namespace SoulmateStore.Services.Interfaces;

public interface ISeoService
{
    Task<string> GenerateSitemapAsync();
}
