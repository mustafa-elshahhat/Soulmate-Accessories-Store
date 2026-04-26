using System.Security.Cryptography;
using System.Text;
using Microsoft.EntityFrameworkCore;
using SoulmateStore.Data;
using SoulmateStore.Exceptions;
using SoulmateStore.Models;
using SoulmateStore.Services.Interfaces;

namespace SoulmateStore.Services.Implementations;

public class InternalService : IInternalService
{
    private readonly AppDbContext _db;
    private readonly byte[] _expectedKey;
    private readonly ILogger<InternalService> _logger;

    public InternalService(AppDbContext db, IConfiguration config, ILogger<InternalService> logger)
    {
        _db = db;
        _logger = logger;
        var key = config["InternalApi:Key"]
            ?? throw new InvalidOperationException("InternalApi:Key not configured");
        _expectedKey = Encoding.UTF8.GetBytes(key);
    }

    public void ValidateKey(string? headerKey)
    {
        if (string.IsNullOrEmpty(headerKey))
            throw new UnauthorizedException("INVALID_KEY", "Missing or invalid internal API key");

        var actual = Encoding.UTF8.GetBytes(headerKey);
        if (actual.Length != _expectedKey.Length || !CryptographicOperations.FixedTimeEquals(actual, _expectedKey))
            throw new UnauthorizedException("INVALID_KEY", "Missing or invalid internal API key");
    }

    public async Task<string?> GetSettingAsync(string key)
    {
        var setting = await _db.SystemSettings
            .AsNoTracking()
            .FirstOrDefaultAsync(s => s.Key == key);

        if (setting == null)
            throw new NotFoundException("SETTING_NOT_FOUND", $"Setting '{key}' not found");

        return setting.Value;
    }

    public async Task SetSettingAsync(string key, string value)
    {
        var setting = await _db.SystemSettings.FirstOrDefaultAsync(s => s.Key == key);

        if (setting == null)
        {
            setting = new SystemSetting
            {
                Key = key,
                Value = value,
                UpdatedAt = DateTime.UtcNow
            };
            _db.SystemSettings.Add(setting);
        }
        else
        {
            setting.Value = value;
            setting.UpdatedAt = DateTime.UtcNow;
        }

        await _db.SaveChangesAsync();
        _logger.LogInformation("System setting '{Key}' updated", key);
    }
}
