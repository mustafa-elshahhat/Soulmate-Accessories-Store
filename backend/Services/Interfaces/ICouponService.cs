using SoulmateStore.DTOs.Coupons;

namespace SoulmateStore.Services.Interfaces;

public interface ICouponService
{
    Task<List<CouponResponseDto>> GetAllAsync();
    Task<CouponResponseDto> GetByIdAsync(Guid id);
    Task<CouponResponseDto> CreateAsync(CreateCouponDto dto);
    Task<CouponResponseDto> UpdateAsync(Guid id, UpdateCouponDto dto);
    Task DeleteAsync(Guid id);
    Task<CouponValidationResultDto> ValidateAsync(string code, decimal orderTotal);
    Task IncrementUsageAsync(string code);
}
