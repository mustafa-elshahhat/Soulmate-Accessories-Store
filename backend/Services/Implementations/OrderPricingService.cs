using Microsoft.EntityFrameworkCore;
using SoulmateStore.Data;
using SoulmateStore.DTOs.Orders;
using SoulmateStore.Exceptions;
using SoulmateStore.Models;
using SoulmateStore.Models.Enums;
using SoulmateStore.Services.Interfaces;
using System.Text.Json;

namespace SoulmateStore.Services.Implementations;

public class OrderPricingService : IOrderPricingService
{
    private readonly AppDbContext _db;
    private readonly IPromotionService _promotions;
    private readonly ILogger<OrderPricingService> _logger;

    public OrderPricingService(AppDbContext db, IPromotionService promotions, ILogger<OrderPricingService> logger)
    {
        _db = db;
        _promotions = promotions;
        _logger = logger;
    }

    public async Task<(List<OrderItem> Items, decimal TotalPrice)> CalculateItemPricesAsync(List<CreateOrderItemDto> dtoItems)
    {
        var productIds = new HashSet<Guid>();
        var boxTypeIds = new HashSet<Guid>();

        foreach (var item in dtoItems)
        {
            if (item.ProductId.HasValue && item.BoxTypeId.HasValue)
                throw new BadRequestException("INVALID_ITEM", "العنصر لا يمكن أن يحتوي على منتج ونوع بوكس في نفس الوقت");
            
            if (!item.ProductId.HasValue && !item.BoxTypeId.HasValue)
                throw new BadRequestException("INVALID_ITEM", "العنصر يجب أن يحتوي على منتج أو نوع بوكس");

            if (item.ProductId.HasValue) productIds.Add(item.ProductId.Value);
            if (item.BoxTypeId.HasValue) boxTypeIds.Add(item.BoxTypeId.Value);

            // Extract products from box slots
            if (item.BoxTypeId.HasValue && !string.IsNullOrWhiteSpace(item.CustomDataJson))
            {
                var customData = ParseCustomData(item.CustomDataJson);
                if (customData.Slots != null)
                {
                    foreach (var pid in customData.Slots.Values)
                    {
                        if (pid != Guid.Empty) productIds.Add(pid);
                    }
                }
            }
        }

        var productsDict = productIds.Count > 0
            ? await _db.Products.AsNoTracking().Where(p => productIds.Contains(p.Id)).ToDictionaryAsync(p => p.Id)
            : new Dictionary<Guid, Product>();

        var boxTypesDict = boxTypeIds.Count > 0
            ? await _db.BoxTypes.AsNoTracking()
                .Include(b => b.BoxSlots)
                .Where(b => boxTypeIds.Contains(b.Id))
                .ToDictionaryAsync(b => b.Id)
            : new Dictionary<Guid, BoxType>();

        var customizationPrices = await _db.CategoryCustomizationPrices
            .AsNoTracking()
            .ToDictionaryAsync(c => c.Category, c => c.Price);

        decimal totalPrice = 0;
        var orderItems = new List<OrderItem>();

        foreach (var item in dtoItems)
        {
            decimal unitPrice = 0;

            if (item.ProductId.HasValue)
            {
                if (!productsDict.TryGetValue(item.ProductId.Value, out var product))
                    throw new NotFoundException("PRODUCT_NOT_FOUND", "المنتج مش موجود");
                
                if (!product.IsActive)
                    throw new ConflictException("PRODUCT_INACTIVE", $"المنتج '{product.Name}' غير متاح حالياً");

                unitPrice = await GetFinalProductPriceAsync(product);
            }
            else if (item.BoxTypeId.HasValue)
            {
                if (!boxTypesDict.TryGetValue(item.BoxTypeId.Value, out var boxType))
                    throw new NotFoundException("BOX_TYPE_NOT_FOUND", "نوع البوكس مش موجود");
                
                if (!boxType.IsActive)
                    throw new ConflictException("BOX_TYPE_INACTIVE", $"نوع البوكس '{boxType.Name}' غير متاح حالياً");

                unitPrice = boxType.BasePrice;

                var customData = ParseCustomData(item.CustomDataJson);
                
                // Validate required slots
                foreach (var slot in boxType.BoxSlots.Where(s => s.IsRequired))
                {
                    if (customData.Slots == null || !customData.Slots.TryGetValue(slot.SlotKey, out var pid) || pid == Guid.Empty)
                        throw new BadRequestException("MISSING_REQUIRED_SLOT", $"الخانة '{slot.LabelAr}' مطلوبة في {boxType.Name}");
                }

                // Calculate price and validate each slot product
                if (customData.Slots != null)
                {
                    foreach (var slotEntry in customData.Slots)
                    {
                        var slotKey = slotEntry.Key;
                        var productId = slotEntry.Value;

                        var slotDef = boxType.BoxSlots.FirstOrDefault(s => s.SlotKey == slotKey);
                        if (slotDef == null)
                            throw new BadRequestException("INVALID_SLOT", $"الخانة '{slotKey}' غير تابعة لـ {boxType.Name}");

                        if (productId == Guid.Empty) continue;

                        if (!productsDict.TryGetValue(productId, out var slotProduct))
                            throw new NotFoundException("PRODUCT_NOT_FOUND", $"المنتج في خانة '{slotDef.LabelAr}' مش موجود");

                        if (!slotProduct.IsActive)
                            throw new ConflictException("PRODUCT_INACTIVE", $"المنتج '{slotProduct.Name}' غير متاح حالياً");

                        // Validate appropriateness
                        if (slotProduct.Category != slotDef.SlotKey)
                            throw new BadRequestException("INAPPROPRIATE_PRODUCT", $"المنتج '{slotProduct.Name}' غير مناسب لخانة '{slotDef.LabelAr}'");

                        if (slotDef.FilterGender.HasValue && slotProduct.Gender != slotDef.FilterGender.Value)
                            throw new BadRequestException("INAPPROPRIATE_GENDER", $"المنتج '{slotProduct.Name}' لا يناسب نوع الجنس في خانة '{slotDef.LabelAr}'");

                        unitPrice += await GetFinalProductPriceAsync(slotProduct);

                        // Check customization
                        if (customData.AllCustomizedSlots.Contains(slotKey))
                        {
                            if (!slotProduct.IsCustomizable)
                                throw new BadRequestException("PRODUCT_NOT_CUSTOMIZABLE", $"المنتج '{slotProduct.Name}' لا يقبل التخصيص");
                            
                            if (customizationPrices.TryGetValue(slotProduct.Category, out var custPrice))
                                unitPrice += custPrice;
                        }
                    }
                }
            }

            totalPrice += unitPrice * item.Quantity;
            orderItems.Add(new OrderItem
            {
                ProductId = item.ProductId,
                BoxTypeId = item.BoxTypeId,
                Quantity = item.Quantity,
                UnitPrice = unitPrice,
                CustomDataJson = item.CustomDataJson
            });
        }

        return (orderItems, totalPrice);
    }

    private async Task<decimal> GetFinalProductPriceAsync(Product product)
    {
        var discount = await _promotions.GetActiveDiscountForProductAsync(product.Id, product.Category, product.Price);
        return discount?.discountedPrice ?? product.Price;
    }

    private CustomData ParseCustomData(string? json)
    {
        if (string.IsNullOrWhiteSpace(json)) return new CustomData();
        try
        {
            var options = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
            return JsonSerializer.Deserialize<CustomData>(json, options) ?? new CustomData();
        }
        catch (JsonException)
        {
            throw new BadRequestException("INVALID_JSON", "بيانات التخصيص غير صحيحة");
        }
    }

    private class CustomData
    {
        public Dictionary<string, Guid>? Slots { get; set; }

        [System.Text.Json.Serialization.JsonPropertyName("customized_slots")]
        public List<string>? CustomizedSlotsSnake { get; set; }

        public List<string>? CustomizedSlots { get; set; }

        public List<string> AllCustomizedSlots => 
            (CustomizedSlots ?? new List<string>())
            .Concat(CustomizedSlotsSnake ?? new List<string>())
            .Distinct()
            .ToList();
    }
}
