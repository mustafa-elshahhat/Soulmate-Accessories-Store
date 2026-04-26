using Microsoft.EntityFrameworkCore;
using SoulmateStore.Data;
using SoulmateStore.DTOs.Wishlist;
using SoulmateStore.Exceptions;
using SoulmateStore.Models;
using SoulmateStore.Services.Interfaces;

namespace SoulmateStore.Services.Implementations;

public class WishlistService : IWishlistService
{
    private readonly AppDbContext _db;
    private readonly ILogger<WishlistService> _logger;

    public WishlistService(AppDbContext db, ILogger<WishlistService> logger)
    {
        _db = db;
        _logger = logger;
    }

    public async Task<List<WishlistItemDto>> GetByUserAsync(Guid userId)
    {
        return await _db.Wishlists
            .AsNoTracking()
            .Where(w => w.UserId == userId && w.Product.IsActive)
            .OrderByDescending(w => w.CreatedAt)
            .Select(w => new WishlistItemDto
            {
                Id = w.Id,
                ProductId = w.ProductId,
                Name = w.Product.Name,
                NameEn = w.Product.NameEn,
                Slug = w.Product.Slug,
                Price = w.Product.Price,
                ImageUrl = w.Product.ImageUrl,
                Category = w.Product.Category,
                StockQuantity = w.Product.StockQuantity,
                CreatedAt = w.CreatedAt
            })
            .ToListAsync();
    }

    public async Task<List<Guid>> GetProductIdsByUserAsync(Guid userId)
    {
        return await _db.Wishlists
            .AsNoTracking()
            .Where(w => w.UserId == userId)
            .Select(w => w.ProductId)
            .ToListAsync();
    }

    public async Task AddAsync(Guid userId, Guid productId)
    {
        var product = await _db.Products.AsNoTracking().FirstOrDefaultAsync(p => p.Id == productId && p.IsActive)
            ?? throw new NotFoundException("PRODUCT_NOT_FOUND", "المنتج مش موجود");

        var exists = await _db.Wishlists.AnyAsync(w => w.UserId == userId && w.ProductId == productId);
        if (exists)
            throw new ConflictException("ALREADY_IN_WISHLIST", "المنتج موجود في المفضلة بالفعل");

        _db.Wishlists.Add(new Wishlist
        {
            UserId = userId,
            ProductId = productId,
            CreatedAt = DateTime.UtcNow
        });

        await _db.SaveChangesAsync();
        _logger.LogInformation("User {UserId} added product {ProductId} to wishlist", userId, productId);
    }

    public async Task RemoveAsync(Guid userId, Guid productId)
    {
        var item = await _db.Wishlists.FirstOrDefaultAsync(w => w.UserId == userId && w.ProductId == productId)
            ?? throw new NotFoundException("NOT_IN_WISHLIST", "المنتج مش موجود في المفضلة");

        _db.Wishlists.Remove(item);
        await _db.SaveChangesAsync();
        _logger.LogInformation("User {UserId} removed product {ProductId} from wishlist", userId, productId);
    }
}
