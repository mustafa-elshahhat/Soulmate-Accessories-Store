namespace SoulmateStore.Services.Interfaces;

public interface IUploadService
{
    Task<string> UploadImageAsync(IFormFile file);
}
