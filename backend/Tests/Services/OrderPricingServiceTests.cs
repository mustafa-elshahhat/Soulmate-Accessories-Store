using Microsoft.EntityFrameworkCore;
using SoulmateStore.Data;
using SoulmateStore.DTOs.Orders;
using SoulmateStore.Exceptions;
using SoulmateStore.Models;
using SoulmateStore.Models.Enums;
using SoulmateStore.Services.Implementations;
using System.Text.Json;
using Xunit;

namespace SoulmateStore.Tests.Services;

public class OrderPricingServiceTests
{
    private readonly AppDbContext _db;
    private readonly OrderPricingService _service;
    private readonly PromotionService _promotionService;

    public OrderPricingServiceTests()
    {
        _db = TestHelpers.CreateInMemoryContext();
        var logger = TestHelpers.CreateLogger<OrderPricingService>();
        var promoLogger = TestHelpers.CreateLogger<PromotionService>();
        _promotionService = new PromotionService(_db, promoLogger);
        _service = new OrderPricingService(_db, _promotionService, logger);
    }

    [Fact]
    public async Task CalculateItemPricesAsync_StandaloneProduct_ReturnsCorrectPrice()
    {
        // Arrange
        var product = TestHelpers.CreateTestProduct(category: "standalone-test", price: 150m);
        _db.Products.Add(product);
        await _db.SaveChangesAsync();

        var dto = new List<CreateOrderItemDto>
        {
            new() { ProductId = product.Id, Quantity = 2 }
        };

        // Act
        var (items, totalPrice) = await _service.CalculateItemPricesAsync(dto);

        // Assert
        Assert.Single(items);
        Assert.Equal(150m, items[0].UnitPrice);
        Assert.Equal(300m, totalPrice);
    }

    [Fact]
    public async Task CalculateItemPricesAsync_ProductWithPromotion_ReturnsDiscountedPrice()
    {
        // Arrange
        var product = TestHelpers.CreateTestProduct(category: "standalone-test", price: 100m);
        _db.Products.Add(product);

        var promotion = new Promotion
        {
            Id = Guid.NewGuid(),
            Name = "Test Promo",
            DiscountType = DiscountType.Percentage,
            Value = 20, // 20% off
            StartDate = DateTime.UtcNow.AddDays(-1),
            EndDate = DateTime.UtcNow.AddDays(1),
            IsActive = true,
            ProductId = product.Id,
            Category = "standalone-test"
        };
        _db.Promotions.Add(promotion);
        await _db.SaveChangesAsync();

        var dto = new List<CreateOrderItemDto>
        {
            new() { ProductId = product.Id, Quantity = 1 }
        };

        // Act
        var (items, totalPrice) = await _service.CalculateItemPricesAsync(dto);

        // Assert
        Assert.Equal(80m, items[0].UnitPrice);
        Assert.Equal(80m, totalPrice);
    }

    [Fact]
    public async Task CalculateItemPricesAsync_BoxWithSlots_ReturnsBasePlusProducts()
    {
        // Arrange
        var boxType = TestHelpers.CreateTestBoxType(basePrice: 50m);
        var slot1 = TestHelpers.CreateTestSlot(boxType.Id, "test-watch", isRequired: true);
        var slot2 = TestHelpers.CreateTestSlot(boxType.Id, "test-perfume", isRequired: false);
        _db.BoxTypes.Add(boxType);
        _db.BoxSlots.AddRange(slot1, slot2);

        var p1 = TestHelpers.CreateTestProduct(category: "test-watch", price: 100m);
        var p2 = TestHelpers.CreateTestProduct(category: "test-perfume", price: 150m);
        _db.Products.AddRange(p1, p2);
        await _db.SaveChangesAsync();

        var customData = new { slots = new Dictionary<string, Guid> { ["test-watch"] = p1.Id, ["test-perfume"] = p2.Id } };
        var json = JsonSerializer.Serialize(customData);

        var dto = new List<CreateOrderItemDto>
        {
            new() { BoxTypeId = boxType.Id, Quantity = 1, CustomDataJson = json }
        };

        // Act
        var (items, totalPrice) = await _service.CalculateItemPricesAsync(dto);

        // Assert
        // 50 (base) + 100 (p1) + 150 (p2) = 300
        Assert.Equal(300m, totalPrice);
    }

    [Fact]
    public async Task CalculateItemPricesAsync_CustomizedSlots_SupportsSnakeAndCamelCase()
    {
        // Arrange
        var boxType = TestHelpers.CreateTestBoxType(basePrice: 0m);
        var slot = TestHelpers.CreateTestSlot(boxType.Id, "test-watch");
        _db.BoxTypes.Add(boxType);
        _db.BoxSlots.Add(slot);

        var product = TestHelpers.CreateTestProduct(category: "test-watch", price: 100m);
        product.IsCustomizable = true;
        _db.Products.Add(product);

        var custPrice = new CategoryCustomizationPrice { Category = "test-watch", Price = 25m };
        _db.CategoryCustomizationPrices.Add(custPrice);
        await _db.SaveChangesAsync();

        // 1. Test customized_slots (snake_case)
        var snakeJson = "{\"slots\": {\"test-watch\": \"" + product.Id + "\"}, \"customized_slots\": [\"test-watch\"]}";
        var dtoSnake = new List<CreateOrderItemDto> { new() { BoxTypeId = boxType.Id, Quantity = 1, CustomDataJson = snakeJson } };
        
        // 2. Test customizedSlots (camelCase)
        var camelJson = "{\"slots\": {\"test-watch\": \"" + product.Id + "\"}, \"customizedSlots\": [\"test-watch\"]}";
        var dtoCamel = new List<CreateOrderItemDto> { new() { BoxTypeId = boxType.Id, Quantity = 1, CustomDataJson = camelJson } };

        // Act
        var (_, totalSnake) = await _service.CalculateItemPricesAsync(dtoSnake);
        var (_, totalCamel) = await _service.CalculateItemPricesAsync(dtoCamel);

        // Assert
        Assert.Equal(125m, totalSnake);
        Assert.Equal(125m, totalCamel);
    }

    [Fact]
    public async Task CalculateItemPricesAsync_InvalidJson_ThrowsBadRequest()
    {
        // Arrange
        var boxType = TestHelpers.CreateTestBoxType();
        _db.BoxTypes.Add(boxType);
        await _db.SaveChangesAsync();

        var dto = new List<CreateOrderItemDto>
        {
            new() { BoxTypeId = boxType.Id, Quantity = 1, CustomDataJson = "{ invalid json }" }
        };

        // Act & Assert
        var ex = await Assert.ThrowsAsync<BadRequestException>(() => _service.CalculateItemPricesAsync(dto));
        Assert.Equal("INVALID_JSON", ex.ErrorCode);
    }

    [Fact]
    public async Task CalculateItemPricesAsync_MissingRequiredSlot_ThrowsBadRequest()
    {
        // Arrange
        var boxType = TestHelpers.CreateTestBoxType();
        var slot = TestHelpers.CreateTestSlot(boxType.Id, "watch", isRequired: true);
        _db.BoxTypes.Add(boxType);
        _db.BoxSlots.Add(slot);
        await _db.SaveChangesAsync();

        var dto = new List<CreateOrderItemDto>
        {
            new() { BoxTypeId = boxType.Id, Quantity = 1, CustomDataJson = "{\"slots\": {}}" }
        };

        // Act & Assert
        var ex = await Assert.ThrowsAsync<BadRequestException>(() => _service.CalculateItemPricesAsync(dto));
        Assert.Equal("MISSING_REQUIRED_SLOT", ex.ErrorCode);
    }
}
