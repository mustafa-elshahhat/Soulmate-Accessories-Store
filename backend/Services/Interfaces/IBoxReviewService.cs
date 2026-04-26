using SoulmateStore.DTOs.BoxReviews;

namespace SoulmateStore.Services.Interfaces;

public interface IBoxReviewService
{
    Task<BoxReviewsSummaryDto> GetByBoxTypeAsync(Guid boxTypeId, int page, int limit);
    Task<BoxReviewResponseDto> CreateAsync(CreateBoxReviewDto dto, Guid userId);
    Task DeleteAsync(Guid id, Guid userId);
    Task AdminDeleteAsync(Guid id);
    Task<List<BoxReviewResponseDto>> GetAllAdminAsync();
}
