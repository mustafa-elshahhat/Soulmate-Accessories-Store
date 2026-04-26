using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using SoulmateStore.Exceptions;
using SoulmateStore.Services.Interfaces;

namespace SoulmateStore.Services.Implementations;

public class UploadService : IUploadService
{
    private readonly Cloudinary _cloudinary;
    private readonly ILogger<UploadService> _logger;

    public UploadService(IConfiguration config, ILogger<UploadService> logger)
    {
        var cloud = config["Cloudinary:CloudName"]
            ?? throw new InvalidOperationException("Cloudinary:CloudName is not configured");
        var apiKey = config["Cloudinary:ApiKey"]
            ?? throw new InvalidOperationException("Cloudinary:ApiKey is not configured");
        var apiSecret = config["Cloudinary:ApiSecret"]
            ?? throw new InvalidOperationException("Cloudinary:ApiSecret is not configured");

        _cloudinary = new Cloudinary(new Account(cloud, apiKey, apiSecret));
        _logger = logger;
    }

    public async Task<string> UploadImageAsync(IFormFile file)
    {
        if (file.Length == 0)
            throw new AppException("EMPTY_FILE", "الملف فاضي");

        if (file.Length > 5 * 1024 * 1024)
            throw new AppException("FILE_TOO_LARGE", "حجم الملف أكبر من 5 ميجا");

        var allowedTypes = new[] { "image/jpeg", "image/png", "image/webp" };
        if (!allowedTypes.Contains(file.ContentType))
            throw new AppException("INVALID_FILE_TYPE", "نوع الملف مش مسموح بيه. المسموح: JPEG, PNG, WEBP");

        await using var stream = file.OpenReadStream();
        var uploadParams = new ImageUploadParams
        {
            File = new FileDescription(file.FileName, stream),
            Folder = "soulmate-store",
            Transformation = new Transformation().Quality("auto").FetchFormat("auto")
        };

        var result = await _cloudinary.UploadAsync(uploadParams);

        if (result.Error is not null)
        {
            _logger.LogError("Cloudinary upload failed: {Error}", result.Error.Message);
            throw new AppException("UPLOAD_FAILED", "فشل رفع الصورة");
        }

        return result.SecureUrl.ToString();
    }
}
