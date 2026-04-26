using System.Text.RegularExpressions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using SoulmateStore.Data;
using SoulmateStore.DTOs.Common;
using SoulmateStore.DTOs.Products;
using SoulmateStore.Exceptions;
using SoulmateStore.Models;
using SoulmateStore.Models.Enums;
using SoulmateStore.Services.Interfaces;

namespace SoulmateStore.Services.Implementations;

public partial class ProductService : IProductService
{
    private readonly AppDbContext _db;
    private readonly IPromotionService _promotions;
    private readonly ILogger<ProductService> _logger;

    public ProductService(AppDbContext db, IPromotionService promotions, ILogger<ProductService> logger)
    {
        _db = db;
        _promotions = promotions;
        _logger = logger;
    }

    public async Task<PaginatedResponse<ProductResponseDto>> GetAllAsync(
        int page, int limit, string? search, string? sort, string? order,
        string? gender, string? category, int? minRating = null, decimal? minPrice = null, decimal? maxPrice = null)
    {
        var query = _db.Products
            .AsNoTracking()
            .Where(p => p.IsActive && p.IsStandalone)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(gender) && Enum.TryParse<Gender>(gender, ignoreCase: true, out var parsedGender))
            query = query.Where(p => p.Gender == parsedGender);

        if (!string.IsNullOrWhiteSpace(category))
            query = query.Where(p => p.Category == category);

        if (!string.IsNullOrWhiteSpace(search))
            query = query.Where(p => p.Name.Contains(search) || p.Description.Contains(search));

        if (minPrice.HasValue)
            query = query.Where(p => p.Price >= minPrice.Value);

        if (maxPrice.HasValue)
            query = query.Where(p => p.Price <= maxPrice.Value);

        // Join with reviews for rating data (single subquery, avoids N+1)
        var queryWithRating = query.Select(p => new
        {
            Product = p,
            ReviewStats = _db.Reviews.Where(r => r.ProductId == p.Id)
                .GroupBy(r => r.ProductId)
                .Select(g => new { Avg = g.Average(r => (double)r.Rating), Count = g.Count() })
                .FirstOrDefault()
        }).Select(x => new
        {
            x.Product,
            AvgRating = x.ReviewStats != null ? x.ReviewStats.Avg : 0.0,
            ReviewCount = x.ReviewStats != null ? x.ReviewStats.Count : 0
        });

        if (minRating.HasValue && minRating.Value > 0)
            queryWithRating = queryWithRating.Where(x => x.AvgRating >= minRating.Value);

        var total = await queryWithRating.CountAsync();

        queryWithRating = sort?.ToLowerInvariant() switch
        {
            "price" => order == "desc" ? queryWithRating.OrderByDescending(x => x.Product.Price) : queryWithRating.OrderBy(x => x.Product.Price),
            "name" => order == "desc" ? queryWithRating.OrderByDescending(x => x.Product.Name) : queryWithRating.OrderBy(x => x.Product.Name),
            "rating" => queryWithRating.OrderByDescending(x => x.AvgRating),
            "newest" => queryWithRating.OrderByDescending(x => x.Product.CreatedAt),
            _ => queryWithRating.OrderByDescending(x => x.Product.CreatedAt)
        };

        var items = await queryWithRating
            .Skip((page - 1) * limit)
            .Take(limit)
            .Select(x => new ProductResponseDto
            {
                Id = x.Product.Id,
                Name = x.Product.Name,
                NameEn = x.Product.NameEn,
                Slug = x.Product.Slug,
                Description = x.Product.Description,
                DescriptionEn = x.Product.DescriptionEn,
                Price = x.Product.Price,
                ImageUrl = x.Product.ImageUrl,
                GalleryJson = x.Product.GalleryJson,
                Category = x.Product.Category,
                Gender = x.Product.Gender,
                IsActive = x.Product.IsActive,
                IsStandalone = x.Product.IsStandalone,
                IsBuilderItem = x.Product.IsBuilderItem,
                IsCustomizable = x.Product.IsCustomizable,
                StockQuantity = x.Product.StockQuantity,
                AverageRating = Math.Round(x.AvgRating, 1),
                ReviewCount = x.ReviewCount,
                CreatedAt = x.Product.CreatedAt,
                UpdatedAt = x.Product.UpdatedAt
            })
            .ToListAsync();

        await ApplyPromotionsAsync(items);

        return PaginatedResponse<ProductResponseDto>.Create(items, page, limit, total);
    }

    public async Task<PaginatedResponse<ProductResponseDto>> GetAllAdminAsync(int page, int limit, string? search)
    {
        var query = _db.Products.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
            query = query.Where(p => p.Name.Contains(search) || p.Description.Contains(search));

        query = query.OrderByDescending(p => p.CreatedAt);

        var total = await query.CountAsync();
        var items = await query
            .Skip((page - 1) * limit)
            .Take(limit)
            .Select(p => new
            {
                Product = p,
                ReviewStats = _db.Reviews.Where(r => r.ProductId == p.Id)
                    .GroupBy(r => r.ProductId)
                    .Select(g => new { Avg = g.Average(r => (double)r.Rating), Count = g.Count() })
                    .FirstOrDefault()
            })
            .Select(x => new ProductResponseDto
            {
                Id = x.Product.Id,
                Name = x.Product.Name,
                NameEn = x.Product.NameEn,
                Slug = x.Product.Slug,
                Description = x.Product.Description,
                DescriptionEn = x.Product.DescriptionEn,
                Price = x.Product.Price,
                ImageUrl = x.Product.ImageUrl,
                GalleryJson = x.Product.GalleryJson,
                Category = x.Product.Category,
                Gender = x.Product.Gender,
                IsActive = x.Product.IsActive,
                IsStandalone = x.Product.IsStandalone,
                IsBuilderItem = x.Product.IsBuilderItem,
                IsCustomizable = x.Product.IsCustomizable,
                StockQuantity = x.Product.StockQuantity,
                AverageRating = Math.Round(x.ReviewStats != null ? x.ReviewStats.Avg : 0, 1),
                ReviewCount = x.ReviewStats != null ? x.ReviewStats.Count : 0,
                CreatedAt = x.Product.CreatedAt,
                UpdatedAt = x.Product.UpdatedAt
            })
            .ToListAsync();

        return PaginatedResponse<ProductResponseDto>.Create(items, page, limit, total);
    }

    public async Task<ProductResponseDto> GetBySlugAsync(string slug)
    {
        var product = await _db.Products.AsNoTracking().FirstOrDefaultAsync(p => p.Slug == slug && p.IsActive)
            ?? throw new NotFoundException("PRODUCT_NOT_FOUND", "المنتج مش موجود");

        return await MapToDtoWithRating(product);
    }

    public async Task<List<ProductResponseDto>> GetRelatedAsync(string slug, int limit)
    {
        var product = await _db.Products.AsNoTracking().FirstOrDefaultAsync(p => p.Slug == slug && p.IsActive)
            ?? throw new NotFoundException("PRODUCT_NOT_FOUND", "المنتج مش موجود");

        var related = await _db.Products
            .AsNoTracking()
            .Where(p => p.IsActive && p.IsStandalone && p.Id != product.Id)
            .Where(p => p.Category == product.Category || p.Gender == product.Gender)
            .OrderByDescending(p => p.Category == product.Category && p.Gender == product.Gender)
            .ThenByDescending(p => p.Category == product.Category)
            .ThenBy(p => Guid.NewGuid())
            .Take(limit)
            .Select(p => new
            {
                Product = p,
                ReviewStats = _db.Reviews.Where(r => r.ProductId == p.Id)
                    .GroupBy(r => r.ProductId)
                    .Select(g => new { Avg = g.Average(r => (double)r.Rating), Count = g.Count() })
                    .FirstOrDefault()
            })
            .Select(x => new ProductResponseDto
            {
                Id = x.Product.Id,
                Name = x.Product.Name,
                NameEn = x.Product.NameEn,
                Slug = x.Product.Slug,
                Description = x.Product.Description,
                DescriptionEn = x.Product.DescriptionEn,
                Price = x.Product.Price,
                ImageUrl = x.Product.ImageUrl,
                GalleryJson = x.Product.GalleryJson,
                Category = x.Product.Category,
                Gender = x.Product.Gender,
                IsActive = x.Product.IsActive,
                IsStandalone = x.Product.IsStandalone,
                IsBuilderItem = x.Product.IsBuilderItem,
                IsCustomizable = x.Product.IsCustomizable,
                StockQuantity = x.Product.StockQuantity,
                AverageRating = Math.Round(x.ReviewStats != null ? x.ReviewStats.Avg : 0, 1),
                ReviewCount = x.ReviewStats != null ? x.ReviewStats.Count : 0,
                CreatedAt = x.Product.CreatedAt,
                UpdatedAt = x.Product.UpdatedAt
            })
            .ToListAsync();

        await ApplyPromotionsAsync(related);

        return related;
    }

    public async Task<ProductResponseDto> GetByIdAsync(Guid id)
    {
        var product = await _db.Products.FindAsync(id)
            ?? throw new NotFoundException("PRODUCT_NOT_FOUND", "المنتج مش موجود");

        return await MapToDtoWithRating(product);
    }

    public async Task<ProductResponseDto> CreateAsync(CreateProductDto dto)
    {
        var slug = GenerateSlug(dto.Name);

        // Ensure unique slug
        var baseSlug = slug;
        var counter = 1;
        while (await _db.Products.AnyAsync(p => p.Slug == slug))
        {
            slug = $"{baseSlug}-{counter}";
            counter++;
        }

        var product = new Product
        {
            Name = dto.Name,
            NameEn = dto.NameEn,
            Slug = slug,
            Description = dto.Description,
            DescriptionEn = dto.DescriptionEn,
            Price = dto.Price,
            ImageUrl = dto.ImageUrl,
            GalleryJson = dto.GalleryJson,
            Category = dto.Category,
            Gender = dto.Gender,
            IsStandalone = dto.IsStandalone,
            IsBuilderItem = dto.IsBuilderItem,
            IsCustomizable = dto.IsCustomizable,
            StockQuantity = dto.StockQuantity,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _db.Products.Add(product);
        await _db.SaveChangesAsync();

        _logger.LogInformation("Product created: {ProductSlug}", product.Slug);

        return await MapToDtoWithRating(product);
    }

    public async Task<ProductResponseDto> UpdateAsync(Guid id, UpdateProductDto dto)
    {
        var product = await _db.Products.FindAsync(id)
            ?? throw new NotFoundException("PRODUCT_NOT_FOUND", "المنتج مش موجود");

        // Regenerate slug if name changed
        if (product.Name != dto.Name)
        {
            var slug = GenerateSlug(dto.Name);
            var baseSlug = slug;
            var counter = 1;
            while (await _db.Products.AnyAsync(p => p.Slug == slug && p.Id != id))
            {
                slug = $"{baseSlug}-{counter}";
                counter++;
            }
            product.Slug = slug;
        }

        product.Name = dto.Name;
        product.NameEn = dto.NameEn;
        product.Description = dto.Description;
        product.DescriptionEn = dto.DescriptionEn;
        product.Price = dto.Price;
        product.ImageUrl = dto.ImageUrl;
        product.GalleryJson = dto.GalleryJson;
        product.Category = dto.Category;
        product.Gender = dto.Gender;
        product.IsActive = dto.IsActive;
        product.IsStandalone = dto.IsStandalone;
        product.IsBuilderItem = dto.IsBuilderItem;
        product.IsCustomizable = dto.IsCustomizable;
        product.StockQuantity = dto.StockQuantity;
        product.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        _logger.LogInformation("Product {ProductId} updated", id);

        return await MapToDtoWithRating(product);
    }

    public async Task DeleteAsync(Guid id)
    {
        var product = await _db.Products.FindAsync(id)
            ?? throw new NotFoundException("PRODUCT_NOT_FOUND", "المنتج مش موجود");

        // Soft delete
        product.IsActive = false;
        product.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        _logger.LogInformation("Product {ProductId} soft-deleted", id);
    }

    private static string GenerateSlug(string name)
    {
        var slug = name.ToLowerInvariant().Trim();
        slug = SlugWhitespaceRegex().Replace(slug, "-");
        slug = SlugSpecialCharsRegex().Replace(slug, "");
        slug = SlugMultiDashRegex().Replace(slug, "-");
        return slug.Trim('-');
    }

    private async Task<ProductResponseDto> MapToDtoWithRating(Product p)
    {
        var ratingStats = await _db.Reviews
            .AsNoTracking()
            .Where(r => r.ProductId == p.Id)
            .GroupBy(_ => 1)
            .Select(g => new { Avg = g.Average(r => (double)r.Rating), Count = g.Count() })
            .FirstOrDefaultAsync();
        var avgRating = ratingStats != null ? Math.Round(ratingStats.Avg, 1) : 0;
        var reviewCount = ratingStats?.Count ?? 0;
        var customizationPrice = p.IsCustomizable
            ? await _db.CategoryCustomizationPrices.AsNoTracking().Where(c => c.Category == p.Category).Select(c => c.Price).FirstOrDefaultAsync()
            : 0;

        var discount = await _promotions.GetActiveDiscountForProductAsync(p.Id, p.Category, p.Price);

        return new ProductResponseDto
        {
            Id = p.Id,
            Name = p.Name,
            NameEn = p.NameEn,
            Slug = p.Slug,
            Description = p.Description,
            DescriptionEn = p.DescriptionEn,
            Price = p.Price,
            ImageUrl = p.ImageUrl,
            GalleryJson = p.GalleryJson,
            Category = p.Category,
            Gender = p.Gender,
            IsActive = p.IsActive,
            IsStandalone = p.IsStandalone,
            IsBuilderItem = p.IsBuilderItem,
            IsCustomizable = p.IsCustomizable,
            StockQuantity = p.StockQuantity,
            OriginalPrice = discount.HasValue ? p.Price : null,
            FinalPrice = discount?.discountedPrice,
            DiscountPercentage = discount?.discountPercentage,
            CustomizationPrice = customizationPrice,
            AverageRating = avgRating,
            ReviewCount = reviewCount,
            CreatedAt = p.CreatedAt,
            UpdatedAt = p.UpdatedAt
        };
    }

    private async Task ApplyPromotionsAsync(List<ProductResponseDto> items)
    {
        for (var i = 0; i < items.Count; i++)
        {
            var item = items[i];
            var discount = await _promotions.GetActiveDiscountForProductAsync(item.Id, item.Category, item.Price);
            if (discount.HasValue)
            {
                items[i] = item with
                {
                    OriginalPrice = item.Price,
                    FinalPrice = discount.Value.discountedPrice,
                    DiscountPercentage = discount.Value.discountPercentage
                };
            }
        }
    }

    [GeneratedRegex(@"\s+")]
    private static partial Regex SlugWhitespaceRegex();

    [GeneratedRegex(@"[^\w\u0621-\u064A-]")]
    private static partial Regex SlugSpecialCharsRegex();

    [GeneratedRegex(@"-{2,}")]
    private static partial Regex SlugMultiDashRegex();
}
