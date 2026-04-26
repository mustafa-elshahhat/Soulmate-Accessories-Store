namespace SoulmateStore.Services.Interfaces;

public interface IInternalService
{
    void ValidateKey(string? headerKey);
    Task<string?> GetSettingAsync(string key);
    Task SetSettingAsync(string key, string value);
}
