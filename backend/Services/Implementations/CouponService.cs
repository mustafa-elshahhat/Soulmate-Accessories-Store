using Microsoft.EntityFrameworkCore;
using SoulmateStore.Data;
using SoulmateStore.DTOs.Coupons;
using SoulmateStore.Exceptions;
using SoulmateStore.Models;
using SoulmateStore.Models.Enums;
using SoulmateStore.Services.Interfaces;

namespace SoulmateStore.Services.Implementations;

public class CouponService : ICouponService
{
    private readonly AppDbContext _db;
    private readonly ILogger<CouponService> _logger;

    public CouponService(AppDbContext db, ILogger<CouponService> logger)
    {
        _db = db;
        _logger = logger;
    }

    public async Task<List<CouponResponseDto>> GetAllAsync()
    {
        return await _db.Coupons
            .AsNoTracking()
            .OrderByDescending(c => c.CreatedAt)
            .Select(c => MapToDto(c))
            .ToListAsync();
    }

    public async Task<CouponResponseDto> GetByIdAsync(Guid id)
    {
        var coupon = await _db.Coupons.AsNoTracking().FirstOrDefaultAsync(c => c.Id == id)
            ?? throw new NotFoundException("COUPON_NOT_FOUND", "الكوبون مش موجود");

        return MapToDto(coupon);
    }

    public async Task<CouponResponseDto> CreateAsync(CreateCouponDto dto)
    {
        if (dto.DiscountType == DiscountType.Percentage && dto.Value > 100)
            throw new ConflictException("INVALID_PERCENTAGE", "نسبة الخصم لازم تكون من 0.01 لـ 100");

        var exists = await _db.Coupons.AnyAsync(c => c.Code.ToUpper() == dto.Code.ToUpper());
        if (exists)
            throw new ConflictException("COUPON_CODE_EXISTS", "كود الكوبون موجود بالفعل");

        var coupon = new Coupon
        {
            Code = dto.Code.ToUpper(),
            DiscountType = dto.DiscountType,
            Value = dto.Value,
            MaxUses = dto.MaxUses,
            UsedCount = 0,
            ExpirationDate = dto.ExpirationDate,
            IsActive = true,
            MinOrderAmount = dto.MinOrderAmount,
            CreatedAt = DateTime.UtcNow
        };

        _db.Coupons.Add(coupon);
        await _db.SaveChangesAsync();
        _logger.LogInformation("Coupon created: {CouponCode}", coupon.Code);

        return MapToDto(coupon);
    }

    public async Task<CouponResponseDto> UpdateAsync(Guid id, UpdateCouponDto dto)
    {
        if (dto.DiscountType == DiscountType.Percentage && dto.Value > 100)
            throw new ConflictException("INVALID_PERCENTAGE", "نسبة الخصم لازم تكون من 0.01 لـ 100");

        var coupon = await _db.Coupons.FindAsync(id)
            ?? throw new NotFoundException("COUPON_NOT_FOUND", "الكوبون مش موجود");

        var codeConflict = await _db.Coupons.AnyAsync(c => c.Code.ToUpper() == dto.Code.ToUpper() && c.Id != id);
        if (codeConflict)
            throw new ConflictException("COUPON_CODE_EXISTS", "كود الكوبون موجود بالفعل");

        coupon.Code = dto.Code.ToUpper();
        coupon.DiscountType = dto.DiscountType;
        coupon.Value = dto.Value;
        coupon.MaxUses = dto.MaxUses;
        coupon.ExpirationDate = dto.ExpirationDate;
        coupon.IsActive = dto.IsActive;
        coupon.MinOrderAmount = dto.MinOrderAmount;

        await _db.SaveChangesAsync();
        _logger.LogInformation("Coupon {CouponId} updated", id);

        return MapToDto(coupon);
    }

    public async Task DeleteAsync(Guid id)
    {
        var coupon = await _db.Coupons.FindAsync(id)
            ?? throw new NotFoundException("COUPON_NOT_FOUND", "الكوبون مش موجود");

        _db.Coupons.Remove(coupon);
        await _db.SaveChangesAsync();
        _logger.LogInformation("Coupon {CouponId} deleted", id);
    }

    public async Task<CouponValidationResultDto> ValidateAsync(string code, decimal orderTotal)
    {
        var coupon = await _db.Coupons.AsNoTracking().FirstOrDefaultAsync(c => c.Code.ToUpper() == code.ToUpper());

        if (coupon == null)
            return new CouponValidationResultDto { Valid = false, ErrorCode = "COUPON_NOT_FOUND", ErrorMessage = "الكوبون مش موجود", Code = code };

        if (!coupon.IsActive)
            return new CouponValidationResultDto { Valid = false, ErrorCode = "COUPON_INACTIVE", ErrorMessage = "الكوبون مش فعال", Code = code };

        if (coupon.ExpirationDate < DateTime.UtcNow)
            return new CouponValidationResultDto { Valid = false, ErrorCode = "COUPON_EXPIRED", ErrorMessage = "الكوبون منتهي الصلاحية", Code = code };

        if (coupon.UsedCount >= coupon.MaxUses)
            return new CouponValidationResultDto { Valid = false, ErrorCode = "COUPON_MAX_USES", ErrorMessage = "الكوبون وصل لأقصى عدد استخدامات", Code = code };

        if (coupon.MinOrderAmount.HasValue && orderTotal < coupon.MinOrderAmount.Value)
            return new CouponValidationResultDto { Valid = false, ErrorCode = "MIN_ORDER_AMOUNT", ErrorMessage = $"الحد الأدنى للطلب {coupon.MinOrderAmount.Value} جنيه", Code = code };

        var discountAmount = coupon.DiscountType == DiscountType.Percentage
            ? Math.Round(orderTotal * coupon.Value / 100, 2)
            : coupon.Value;

        if (discountAmount > orderTotal)
            discountAmount = orderTotal;

        return new CouponValidationResultDto
        {
            Valid = true,
            DiscountAmount = discountAmount,
            Code = coupon.Code,
            DiscountType = coupon.DiscountType,
            Value = coupon.Value
        };
    }

    public async Task IncrementUsageAsync(string code)
    {
        var rowsAffected = await _db.Database.ExecuteSqlRawAsync(
            "UPDATE Coupons SET UsedCount = UsedCount + 1 WHERE UPPER(Code) = {0} AND UsedCount < MaxUses",
            code.ToUpper());

        if (rowsAffected == 0)
        {
            // Either coupon doesn't exist or max uses reached
            // We check existence to provide a better log/error if needed, but the orchestrator already validated existence.
            _logger.LogWarning("Failed to increment coupon usage for {CouponCode}. Max uses might have been reached.", code);
            throw new ConflictException("COUPON_MAX_USES", "الكوبون وصل لأقصى عدد استخدامات");
        }
    }

    private static CouponResponseDto MapToDto(Coupon c) => new()
    {
        Id = c.Id,
        Code = c.Code,
        DiscountType = c.DiscountType,
        Value = c.Value,
        MaxUses = c.MaxUses,
        UsedCount = c.UsedCount,
        ExpirationDate = c.ExpirationDate,
        IsActive = c.IsActive,
        MinOrderAmount = c.MinOrderAmount,
        CreatedAt = c.CreatedAt
    };
}
