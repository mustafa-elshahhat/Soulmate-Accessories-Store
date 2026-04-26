using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using SoulmateStore.Data;
using SoulmateStore.DTOs.Builder;
using SoulmateStore.Exceptions;
using SoulmateStore.Models.Enums;
using SoulmateStore.Services.Interfaces;

namespace SoulmateStore.Services.Implementations;

public class BuilderService : IBuilderService
{
    private readonly AppDbContext _db;
    private readonly ILogger<BuilderService> _logger;

    public BuilderService(AppDbContext db, ILogger<BuilderService> logger)
    {
        _db = db;
        _logger = logger;
    }

    public async Task<List<BoxTypeDto>> GetBoxTypesAsync()
    {
        return await _db.BoxTypes
            .AsNoTracking()
            .Where(bt => bt.IsActive)
            .OrderBy(bt => bt.Name)
            .Select(bt => new BoxTypeDto
            {
                Id = bt.Id,
                Name = bt.Name,
                NameEn = bt.NameEn,
                Slug = bt.Slug,
                Gender = bt.Gender,
                BasePrice = bt.BasePrice,
                ImageUrl = bt.ImageUrl
            })
            .ToListAsync();
    }

    public async Task<List<BoxSlotDto>> GetSlotsAsync(Guid boxTypeId)
    {
        var boxType = await _db.BoxTypes.AnyAsync(bt => bt.Id == boxTypeId && bt.IsActive);
        if (!boxType)
            throw new NotFoundException("BOX_TYPE_NOT_FOUND", "نوع البوكس مش موجود");

        return await _db.BoxSlots
            .AsNoTracking()
            .Where(bs => bs.BoxTypeId == boxTypeId)
            .OrderBy(bs => bs.SortOrder)
            .Select(bs => new BoxSlotDto
            {
                Id = bs.Id,
                SlotKey = bs.SlotKey,
                LabelAr = bs.LabelAr,
                LabelEn = bs.LabelEn,
                IsRequired = bs.IsRequired,
                SortOrder = bs.SortOrder,
                FilterGender = bs.FilterGender
            })
            .ToListAsync();
    }

    public async Task<List<SlotProductDto>> GetProductsForSlotAsync(string slotKey, Gender? filterGender)
    {
        var query = _db.Products
            .AsNoTracking()
            .Where(p => p.IsActive && p.IsBuilderItem && p.Category == slotKey);

        if (filterGender.HasValue)
            query = query.Where(p => p.Gender == filterGender.Value);

        var customizationPrices = await _db.CategoryCustomizationPrices
            .AsNoTracking()
            .Where(c => c.Category == slotKey)
            .ToDictionaryAsync(c => c.Category, c => c.Price);

        return await query
            .OrderBy(p => p.Name)
            .Select(p => new SlotProductDto
            {
                Id = p.Id,
                Name = p.Name,
                NameEn = p.NameEn,
                Price = p.Price,
                ImageUrl = p.ImageUrl,
                Category = p.Category,
                Gender = p.Gender,
                IsCustomizable = p.IsCustomizable,
                CustomizationPrice = 0
            })
            .ToListAsync()
            .ContinueWith(t => t.Result.Select(p => p with
            {
                CustomizationPrice = p.IsCustomizable && customizationPrices.TryGetValue(p.Category, out var price) ? price : 0
            }).ToList());
    }

    public async Task<List<SlotProductDto>> GetProductsForSlotByIdAsync(Guid slotId)
    {
        var slot = await _db.BoxSlots.FindAsync(slotId)
            ?? throw new NotFoundException("SLOT_NOT_FOUND", "الـ Slot مش موجود");

        return await GetProductsForSlotAsync(slot.SlotKey, slot.FilterGender);
    }

    public async Task<PreviewResponseDto> PreviewAsync(PreviewRequestDto dto)
    {
        var boxType = await _db.BoxTypes.AsNoTracking().FirstOrDefaultAsync(bt => bt.Id == dto.BoxTypeId && bt.IsActive)
            ?? throw new NotFoundException("BOX_TYPE_NOT_FOUND", "نوع البوكس مش موجود");

        var slotIds = dto.Slots.Keys.Select(Guid.Parse).ToList();
        var slots = await _db.BoxSlots
            .AsNoTracking()
            .Where(s => slotIds.Contains(s.Id))
            .ToDictionaryAsync(s => s.Id);

        var productIds = dto.Slots.Values.Distinct().ToList();
        var products = await _db.Products
            .AsNoTracking()
            .Where(p => productIds.Contains(p.Id) && p.IsActive)
            .ToDictionaryAsync(p => p.Id);

        var selectedProducts = new List<PreviewSelectedProductDto>();
        foreach (var (slotIdStr, productId) in dto.Slots)
        {
            var slotId = Guid.Parse(slotIdStr);

            if (!products.TryGetValue(productId, out var product))
                throw new NotFoundException("PRODUCT_NOT_FOUND", $"المنتج مش موجود: {productId}");

            slots.TryGetValue(slotId, out var slot);

            selectedProducts.Add(new PreviewSelectedProductDto
            {
                SlotId = slotId,
                SlotKey = product.Category,
                LabelAr = slot?.LabelAr ?? "",
                LabelEn = slot?.LabelEn ?? "",
                Name = product.Name,
                Price = product.Price
            });
        }

        // Calculate customization pricing
        var customizedProducts = new List<CustomizedProductDto>();
        decimal customizationTotal = 0;

        if (dto.CustomizedSlots.Count > 0)
        {
            var customizedSlotIds = dto.CustomizedSlots.Select(Guid.Parse).ToHashSet();
            var categories = products.Values
                .Where(p => p.IsCustomizable)
                .Select(p => p.Category)
                .Distinct()
                .ToList();

            var categoryPrices = await _db.CategoryCustomizationPrices
                .AsNoTracking()
                .Where(c => categories.Contains(c.Category))
                .ToDictionaryAsync(c => c.Category, c => c.Price);

            foreach (var slotIdStr in dto.CustomizedSlots)
            {
                var slotId = Guid.Parse(slotIdStr);
                if (!dto.Slots.TryGetValue(slotIdStr, out var productId)) continue;
                if (!products.TryGetValue(productId, out var product)) continue;
                if (!product.IsCustomizable) continue;

                var price = categoryPrices.GetValueOrDefault(product.Category, 0);
                customizedProducts.Add(new CustomizedProductDto
                {
                    SlotId = slotId,
                    Name = product.Name,
                    NameEn = product.NameEn,
                    Category = product.Category,
                    CustomizationPrice = price
                });
                customizationTotal += price;
            }
        }

        var totalPrice = boxType.BasePrice + selectedProducts.Sum(p => p.Price) + customizationTotal;

        _logger.LogInformation("Preview generated for box type {BoxTypeId} with {SlotCount} slots", dto.BoxTypeId, dto.Slots.Count);

        return new PreviewResponseDto
        {
            BoxType = new PreviewBoxTypeDto
            {
                Id = boxType.Id,
                Name = boxType.Name,
                NameEn = boxType.NameEn,
                BasePrice = boxType.BasePrice
            },
            SelectedProducts = selectedProducts,
            Customization = dto.Customization,
            CustomizedProducts = customizedProducts,
            CustomizationTotal = customizationTotal,
            TotalPrice = totalPrice
        };
    }
}
