using SoulmateStore.DTOs.Promotions;

namespace SoulmateStore.Services.Interfaces;

public interface IPromotionService
{
    Task<List<PromotionResponseDto>> GetAllAsync();
    Task<PromotionResponseDto> GetByIdAsync(Guid id);
    Task<PromotionResponseDto> CreateAsync(CreatePromotionDto dto);
    Task<PromotionResponseDto> UpdateAsync(Guid id, UpdatePromotionDto dto);
    Task DeleteAsync(Guid id);
    Task<(decimal discountedPrice, decimal discountPercentage)?> GetActiveDiscountForProductAsync(Guid productId, string category, decimal originalPrice);
}
