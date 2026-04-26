using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using SoulmateStore.Data;
using SoulmateStore.DTOs.Reviews;
using SoulmateStore.Exceptions;
using SoulmateStore.Models;
using SoulmateStore.Models.Enums;
using SoulmateStore.Services.Interfaces;

namespace SoulmateStore.Services.Implementations;

public class ReviewService : IReviewService
{
    private readonly AppDbContext _db;
    private readonly ILogger<ReviewService> _logger;

    public ReviewService(AppDbContext db, ILogger<ReviewService> logger)
    {
        _db = db;
        _logger = logger;
    }

    public async Task<ProductReviewsSummaryDto> GetByProductAsync(Guid productId, int page = 1, int limit = 20)
    {
        // Calculate average rating at the database level instead of loading all reviews into memory
        var avgRating = await _db.Reviews
            .Where(r => r.ProductId == productId)
            .Select(r => (double?)r.Rating)
            .AverageAsync() ?? 0;

        var totalReviews = await _db.Reviews
            .CountAsync(r => r.ProductId == productId);

        var reviews = await _db.Reviews
            .AsNoTracking()
            .Where(r => r.ProductId == productId)
            .OrderByDescending(r => r.CreatedAt)
            .Skip((page - 1) * limit)
            .Take(limit)
            .Include(r => r.User)
            .ToListAsync();

        return new ProductReviewsSummaryDto
        {
            AverageRating = Math.Round(avgRating, 1),
            TotalReviews = totalReviews,
            Reviews = reviews.Select(MapToDto).ToList(),
        };
    }

    public async Task<ReviewResponseDto> CreateAsync(CreateReviewDto dto, Guid userId)
    {
        var product = await _db.Products.FindAsync(dto.ProductId)
            ?? throw new NotFoundException("PRODUCT_NOT_FOUND", "المنتج مش موجود");

        // Check if user has purchased and received the product
        var productIdStr = dto.ProductId.ToString();
        var hasPurchased = await _db.Orders
            .Where(o => o.UserId == userId && o.Status == OrderStatus.Delivered)
            .AnyAsync(o => o.OrderItems.Any(i => 
                i.ProductId == dto.ProductId || 
                (i.BoxTypeId != null && i.CustomDataJson != null && i.CustomDataJson.Contains(productIdStr))));

        if (!hasPurchased)
            throw new ConflictException("PRODUCT_NOT_PURCHASED", "لا يمكنك تقييم منتج لم تقم بشرائه واستلامه");

        var exists = await _db.Reviews.AnyAsync(r => r.UserId == userId && r.ProductId == dto.ProductId);
        if (exists)
            throw new ConflictException("REVIEW_EXISTS", "أنت عملت تقييم لهذا المنتج من قبل");

        var review = new Review
        {
            UserId = userId,
            ProductId = dto.ProductId,
            Rating = dto.Rating,
            Comment = Helpers.InputSanitizer.StripHtml(dto.Comment),
        };

        _db.Reviews.Add(review);
        await _db.SaveChangesAsync();

        _logger.LogInformation("Review created by user {UserId} for product {ProductId}", userId, dto.ProductId);

        var user = await _db.Users.FindAsync(userId);
        review.User = user!;

        return MapToDto(review);
    }

    public async Task<ReviewResponseDto> UpdateAsync(Guid reviewId, UpdateReviewDto dto, Guid userId)
    {
        var review = await _db.Reviews.Include(r => r.User)
            .FirstOrDefaultAsync(r => r.Id == reviewId)
            ?? throw new NotFoundException("REVIEW_NOT_FOUND", "التقييم مش موجود");

        if (review.UserId != userId)
            throw new ForbiddenException("NOT_REVIEW_OWNER", "مش مسموح تعدل تقييم حد تاني");

        review.Rating = dto.Rating;
        review.Comment = Helpers.InputSanitizer.StripHtml(dto.Comment);
        await _db.SaveChangesAsync();

        _logger.LogInformation("Review {ReviewId} updated by user {UserId}", reviewId, userId);

        return MapToDto(review);
    }

    public async Task DeleteAsync(Guid reviewId, Guid userId)
    {
        var review = await _db.Reviews.FindAsync(reviewId)
            ?? throw new NotFoundException("REVIEW_NOT_FOUND", "التقييم مش موجود");

        if (review.UserId != userId)
            throw new ForbiddenException("NOT_REVIEW_OWNER", "مش مسموح تمسح تقييم حد تاني");

        _db.Reviews.Remove(review);
        await _db.SaveChangesAsync();

        _logger.LogInformation("Review {ReviewId} deleted by user {UserId}", reviewId, userId);
    }

    private static ReviewResponseDto MapToDto(Review r) => new()
    {
        Id = r.Id,
        UserId = r.UserId,
        UserName = r.User.Name,
        ProductId = r.ProductId,
        Rating = r.Rating,
        Comment = r.Comment,
        CreatedAt = r.CreatedAt,
    };
}
