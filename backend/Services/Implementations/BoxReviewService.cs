using Microsoft.EntityFrameworkCore;
using SoulmateStore.Data;
using SoulmateStore.DTOs.BoxReviews;
using SoulmateStore.Exceptions;
using SoulmateStore.Helpers;
using SoulmateStore.Models;
using SoulmateStore.Models.Enums;
using SoulmateStore.Services.Interfaces;

namespace SoulmateStore.Services.Implementations;

public class BoxReviewService : IBoxReviewService
{
    private readonly AppDbContext _db;
    private readonly ILogger<BoxReviewService> _logger;

    public BoxReviewService(AppDbContext db, ILogger<BoxReviewService> logger)
    {
        _db = db;
        _logger = logger;
    }

    public async Task<BoxReviewsSummaryDto> GetByBoxTypeAsync(Guid boxTypeId, int page, int limit)
    {
        var query = _db.BoxReviews
            .AsNoTracking()
            .Where(br => br.BoxTypeId == boxTypeId);

        var stats = await query
            .GroupBy(_ => 1)
            .Select(g => new { Avg = g.Average(r => (double)r.Rating), Count = g.Count() })
            .FirstOrDefaultAsync();

        var reviews = await query
            .Include(br => br.User)
            .OrderByDescending(br => br.CreatedAt)
            .Skip((page - 1) * limit)
            .Take(limit)
            .Select(br => new BoxReviewResponseDto
            {
                Id = br.Id,
                UserId = br.UserId,
                UserName = br.User.Name,
                BoxTypeId = br.BoxTypeId,
                OrderId = br.OrderId,
                Rating = br.Rating,
                Comment = br.Comment,
                CreatedAt = br.CreatedAt
            })
            .ToListAsync();

        return new BoxReviewsSummaryDto
        {
            AverageRating = stats != null ? Math.Round(stats.Avg, 1) : 0,
            TotalReviews = stats?.Count ?? 0,
            Reviews = reviews
        };
    }

    public async Task<BoxReviewResponseDto> CreateAsync(CreateBoxReviewDto dto, Guid userId)
    {
        // Verify the order exists, belongs to user, and is delivered
        var order = await _db.Orders
            .AsNoTracking()
            .Include(o => o.OrderItems)
            .FirstOrDefaultAsync(o => o.Id == dto.OrderId && o.UserId == userId)
            ?? throw new NotFoundException("ORDER_NOT_FOUND", "الطلب مش موجود");

        if (order.Status != OrderStatus.Delivered)
            throw new ConflictException("ORDER_NOT_DELIVERED", "لازم الطلب يكون تم تسليمه عشان تقدر تقيم");

        // Verify the order contains the box type
        var hasBoxType = order.OrderItems.Any(i => i.BoxTypeId == dto.BoxTypeId);
        if (!hasBoxType)
            throw new ConflictException("BOX_NOT_IN_ORDER", "البوكس مش موجود في الطلب ده");

        // Check for duplicate review
        var exists = await _db.BoxReviews.AnyAsync(br =>
            br.UserId == userId && br.OrderId == dto.OrderId && br.BoxTypeId == dto.BoxTypeId);
        if (exists)
            throw new ConflictException("ALREADY_REVIEWED", "تم تقييم البوكس ده من قبل");

        var sanitizedComment = InputSanitizer.StripHtml(dto.Comment);

        var review = new BoxReview
        {
            UserId = userId,
            BoxTypeId = dto.BoxTypeId,
            OrderId = dto.OrderId,
            Rating = dto.Rating,
            Comment = sanitizedComment,
            CreatedAt = DateTime.UtcNow
        };

        _db.BoxReviews.Add(review);
        await _db.SaveChangesAsync();
        _logger.LogInformation("BoxReview created by {UserId} for BoxType {BoxTypeId}", userId, dto.BoxTypeId);

        var user = await _db.Users.AsNoTracking().FirstAsync(u => u.Id == userId);
        return new BoxReviewResponseDto
        {
            Id = review.Id,
            UserId = review.UserId,
            UserName = user.Name,
            BoxTypeId = review.BoxTypeId,
            OrderId = review.OrderId,
            Rating = review.Rating,
            Comment = review.Comment,
            CreatedAt = review.CreatedAt
        };
    }

    public async Task DeleteAsync(Guid id, Guid userId)
    {
        var review = await _db.BoxReviews.FirstOrDefaultAsync(br => br.Id == id && br.UserId == userId)
            ?? throw new NotFoundException("REVIEW_NOT_FOUND", "التقييم مش موجود");

        _db.BoxReviews.Remove(review);
        await _db.SaveChangesAsync();
        _logger.LogInformation("BoxReview {ReviewId} deleted by user {UserId}", id, userId);
    }

    public async Task AdminDeleteAsync(Guid id)
    {
        var review = await _db.BoxReviews.FindAsync(id)
            ?? throw new NotFoundException("REVIEW_NOT_FOUND", "التقييم مش موجود");

        _db.BoxReviews.Remove(review);
        await _db.SaveChangesAsync();
        _logger.LogInformation("BoxReview {ReviewId} deleted by admin", id);
    }

    public async Task<List<BoxReviewResponseDto>> GetAllAdminAsync()
    {
        return await _db.BoxReviews
            .AsNoTracking()
            .Include(br => br.User)
            .OrderByDescending(br => br.CreatedAt)
            .Select(br => new BoxReviewResponseDto
            {
                Id = br.Id,
                UserId = br.UserId,
                UserName = br.User.Name,
                BoxTypeId = br.BoxTypeId,
                OrderId = br.OrderId,
                Rating = br.Rating,
                Comment = br.Comment,
                CreatedAt = br.CreatedAt
            })
            .ToListAsync();
    }
}
