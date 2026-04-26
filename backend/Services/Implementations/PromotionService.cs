using Microsoft.EntityFrameworkCore;
using SoulmateStore.Data;
using SoulmateStore.DTOs.Promotions;
using SoulmateStore.Exceptions;
using SoulmateStore.Models;
using SoulmateStore.Models.Enums;
using SoulmateStore.Services.Interfaces;

namespace SoulmateStore.Services.Implementations;

public class PromotionService : IPromotionService
{
    private readonly AppDbContext _db;
    private readonly ILogger<PromotionService> _logger;

    public PromotionService(AppDbContext db, ILogger<PromotionService> logger)
    {
        _db = db;
        _logger = logger;
    }

    public async Task<List<PromotionResponseDto>> GetAllAsync()
    {
        return await _db.Promotions
            .AsNoTracking()
            .Include(p => p.Product)
            .OrderByDescending(p => p.CreatedAt)
            .Select(p => MapToDto(p))
            .ToListAsync();
    }

    public async Task<PromotionResponseDto> GetByIdAsync(Guid id)
    {
        var promotion = await _db.Promotions.AsNoTracking().Include(p => p.Product).FirstOrDefaultAsync(p => p.Id == id)
            ?? throw new NotFoundException("PROMOTION_NOT_FOUND", "العرض مش موجود");

        return MapToDto(promotion);
    }

    public async Task<PromotionResponseDto> CreateAsync(CreatePromotionDto dto)
    {
        if (dto.DiscountType == DiscountType.Percentage && dto.Value > 100)
            throw new ConflictException("INVALID_PERCENTAGE", "نسبة الخصم لازم تكون من 0.01 لـ 100");

        if (dto.EndDate <= dto.StartDate)
            throw new ConflictException("INVALID_DATE_RANGE", "تاريخ الانتهاء لازم يكون بعد تاريخ البداية");

        var promotion = new Promotion
        {
            Name = dto.Name,
            NameEn = dto.NameEn,
            DiscountType = dto.DiscountType,
            Value = dto.Value,
            StartDate = dto.StartDate,
            EndDate = dto.EndDate,
            IsActive = true,
            ProductId = dto.ProductId,
            Category = dto.Category,
            CreatedAt = DateTime.UtcNow
        };

        _db.Promotions.Add(promotion);
        await _db.SaveChangesAsync();
        _logger.LogInformation("Promotion created: {PromotionName}", promotion.Name);

        return MapToDto(promotion);
    }

    public async Task<PromotionResponseDto> UpdateAsync(Guid id, UpdatePromotionDto dto)
    {
        if (dto.DiscountType == DiscountType.Percentage && dto.Value > 100)
            throw new ConflictException("INVALID_PERCENTAGE", "نسبة الخصم لازم تكون من 0.01 لـ 100");

        if (dto.EndDate <= dto.StartDate)
            throw new ConflictException("INVALID_DATE_RANGE", "تاريخ الانتهاء لازم يكون بعد تاريخ البداية");

        var promotion = await _db.Promotions.Include(p => p.Product).FirstOrDefaultAsync(p => p.Id == id)
            ?? throw new NotFoundException("PROMOTION_NOT_FOUND", "العرض مش موجود");

        promotion.Name = dto.Name;
        promotion.NameEn = dto.NameEn;
        promotion.DiscountType = dto.DiscountType;
        promotion.Value = dto.Value;
        promotion.StartDate = dto.StartDate;
        promotion.EndDate = dto.EndDate;
        promotion.IsActive = dto.IsActive;
        promotion.ProductId = dto.ProductId;
        promotion.Category = dto.Category;

        await _db.SaveChangesAsync();
        _logger.LogInformation("Promotion {PromotionId} updated", id);

        return MapToDto(promotion);
    }

    public async Task DeleteAsync(Guid id)
    {
        var promotion = await _db.Promotions.FindAsync(id)
            ?? throw new NotFoundException("PROMOTION_NOT_FOUND", "العرض مش موجود");

        _db.Promotions.Remove(promotion);
        await _db.SaveChangesAsync();
        _logger.LogInformation("Promotion {PromotionId} deleted", id);
    }

    public async Task<(decimal discountedPrice, decimal discountPercentage)?> GetActiveDiscountForProductAsync(Guid productId, string category, decimal originalPrice)
    {
        var now = DateTime.UtcNow;

        var promotions = await _db.Promotions
            .AsNoTracking()
            .Where(p => p.IsActive && p.StartDate <= now && p.EndDate >= now)
            .Where(p => p.ProductId == productId || p.Category == category)
            .ToListAsync();

        if (promotions.Count == 0)
            return null;

        // Find the best discount (highest resulting savings)
        decimal bestFinalPrice = originalPrice;
        foreach (var promo in promotions)
        {
            var finalPrice = promo.DiscountType == DiscountType.Percentage
                ? originalPrice * (1 - promo.Value / 100)
                : originalPrice - promo.Value;

            if (finalPrice < 0) finalPrice = 0;
            if (finalPrice < bestFinalPrice)
                bestFinalPrice = finalPrice;
        }

        if (bestFinalPrice >= originalPrice)
            return null;

        var percentage = Math.Round((1 - bestFinalPrice / originalPrice) * 100, 0);
        return (Math.Round(bestFinalPrice, 2), percentage);
    }

    private static PromotionResponseDto MapToDto(Promotion p) => new()
    {
        Id = p.Id,
        Name = p.Name,
        NameEn = p.NameEn,
        DiscountType = p.DiscountType,
        Value = p.Value,
        StartDate = p.StartDate,
        EndDate = p.EndDate,
        IsActive = p.IsActive,
        ProductId = p.ProductId,
        ProductName = p.Product?.Name,
        Category = p.Category,
        CreatedAt = p.CreatedAt
    };
}
