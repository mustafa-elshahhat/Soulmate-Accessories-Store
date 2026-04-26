using Microsoft.Extensions.Diagnostics.HealthChecks;

namespace SoulmateStore.HealthChecks;

public class CloudinaryHealthCheck : IHealthCheck
{
    private readonly IConfiguration _config;
    private readonly HttpClient _httpClient;

    public CloudinaryHealthCheck(IConfiguration config, IHttpClientFactory httpClientFactory)
    {
        _config = config;
        _httpClient = httpClientFactory.CreateClient();
        _httpClient.Timeout = TimeSpan.FromSeconds(5);
    }

    public async Task<HealthCheckResult> CheckHealthAsync(
        HealthCheckContext context, CancellationToken cancellationToken = default)
    {
        try
        {
            var cloudName = _config["Cloudinary:CloudName"];
            if (string.IsNullOrEmpty(cloudName) || cloudName == "your_cloud_name")
            {
                return HealthCheckResult.Degraded("Cloudinary is not configured");
            }

            var response = await _httpClient.GetAsync(
                $"https://res.cloudinary.com/{cloudName}/image/upload/sample.jpg",
                cancellationToken);

            return response.IsSuccessStatusCode
                ? HealthCheckResult.Healthy("Cloudinary is reachable")
                : HealthCheckResult.Degraded($"Cloudinary returned {response.StatusCode}");
        }
        catch (TaskCanceledException)
        {
            return HealthCheckResult.Degraded("Cloudinary health check timed out");
        }
        catch (Exception ex)
        {
            return HealthCheckResult.Unhealthy("Cloudinary is not reachable", ex);
        }
    }
}
