using SoulmateStore.DTOs.Reviews;

namespace SoulmateStore.Services.Interfaces;

public interface IReviewService
{
    Task<ProductReviewsSummaryDto> GetByProductAsync(Guid productId, int page = 1, int limit = 20);
    Task<ReviewResponseDto> CreateAsync(CreateReviewDto dto, Guid userId);
    Task<ReviewResponseDto> UpdateAsync(Guid reviewId, UpdateReviewDto dto, Guid userId);
    Task DeleteAsync(Guid reviewId, Guid userId);
}
