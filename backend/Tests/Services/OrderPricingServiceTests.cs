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

        var customData = new { slots = new Dictionary<string, Guid> { [slot1.Id.ToString()] = p1.Id, [slot2.Id.ToString()] = p2.Id } };
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
        var snakeJson = "{\"slots\": {\"" + slot.Id + "\": \"" + product.Id + "\"}, \"customized_slots\": [\"" + slot.Id + "\"]}";
        var dtoSnake = new List<CreateOrderItemDto> { new() { BoxTypeId = boxType.Id, Quantity = 1, CustomDataJson = snakeJson } };

        // 2. Test customizedSlots (camelCase)
        var camelJson = "{\"slots\": {\"" + slot.Id + "\": \"" + product.Id + "\"}, \"customizedSlots\": [\"" + slot.Id + "\"]}";
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

    [Fact]
    public async Task CalculateItemPricesAsync_SlotsKeyedByProductCategory_ThrowsMissingRequiredSlot()
    {
        // Old (broken) frontend contract keyed slots by SlotKey/category instead of BoxSlot.Id.
        // This must still be rejected as a missing required slot, not silently accepted.
        var boxType = TestHelpers.CreateTestBoxType();
        var slot = TestHelpers.CreateTestSlot(boxType.Id, "test-watch", isRequired: true);
        _db.BoxTypes.Add(boxType);
        _db.BoxSlots.Add(slot);

        var product = TestHelpers.CreateTestProduct(category: "test-watch", price: 100m);
        _db.Products.Add(product);
        await _db.SaveChangesAsync();

        var json = "{\"slots\": {\"test-watch\": \"" + product.Id + "\"}}";
        var dto = new List<CreateOrderItemDto>
        {
            new() { BoxTypeId = boxType.Id, Quantity = 1, CustomDataJson = json }
        };

        var ex = await Assert.ThrowsAsync<BadRequestException>(() => _service.CalculateItemPricesAsync(dto));
        Assert.Equal("MISSING_REQUIRED_SLOT", ex.ErrorCode);
    }

    [Fact]
    public async Task CalculateItemPricesAsync_CoupleBoxDuplicateSlotKeys_FillsBothSlotsByDistinctIds()
    {
        // Couple box has two slots sharing the same SlotKey ("test-watch") - one for him, one for her.
        // The Slots dict must be keyed by the unique BoxSlot.Id so both can be filled independently.
        var boxType = TestHelpers.CreateTestBoxType(basePrice: 100m);
        var watchForHim = TestHelpers.CreateTestSlot(boxType.Id, "test-watch", isRequired: true, sortOrder: 1);
        var watchForHer = TestHelpers.CreateTestSlot(boxType.Id, "test-watch", isRequired: true, sortOrder: 2);
        _db.BoxTypes.Add(boxType);
        _db.BoxSlots.AddRange(watchForHim, watchForHer);

        var hisWatch = TestHelpers.CreateTestProduct(category: "test-watch", gender: Gender.Male, price: 200m);
        var herWatch = TestHelpers.CreateTestProduct(category: "test-watch", gender: Gender.Female, price: 250m);
        _db.Products.AddRange(hisWatch, herWatch);
        await _db.SaveChangesAsync();

        var json = "{\"slots\": {\"" + watchForHim.Id + "\": \"" + hisWatch.Id + "\", \"" + watchForHer.Id + "\": \"" + herWatch.Id + "\"}}";
        var dto = new List<CreateOrderItemDto>
        {
            new() { BoxTypeId = boxType.Id, Quantity = 1, CustomDataJson = json }
        };

        var (items, totalPrice) = await _service.CalculateItemPricesAsync(dto);

        // 100 (base) + 200 (his watch) + 250 (her watch) = 550
        Assert.Single(items);
        Assert.Equal(550m, totalPrice);
    }

    [Fact]
    public async Task CalculateItemPricesAsync_CoupleBoxMissingOneOfDuplicateSlots_ThrowsMissingRequiredSlot()
    {
        var boxType = TestHelpers.CreateTestBoxType(basePrice: 100m);
        var watchForHim = TestHelpers.CreateTestSlot(boxType.Id, "test-watch", isRequired: true, sortOrder: 1);
        var watchForHer = TestHelpers.CreateTestSlot(boxType.Id, "test-watch", isRequired: true, sortOrder: 2);
        _db.BoxTypes.Add(boxType);
        _db.BoxSlots.AddRange(watchForHim, watchForHer);

        var hisWatch = TestHelpers.CreateTestProduct(category: "test-watch", gender: Gender.Male, price: 200m);
        _db.Products.Add(hisWatch);
        await _db.SaveChangesAsync();

        // Only the "watch for him" slot is filled - "watch for her" is missing.
        var json = "{\"slots\": {\"" + watchForHim.Id + "\": \"" + hisWatch.Id + "\"}}";
        var dto = new List<CreateOrderItemDto>
        {
            new() { BoxTypeId = boxType.Id, Quantity = 1, CustomDataJson = json }
        };

        var ex = await Assert.ThrowsAsync<BadRequestException>(() => _service.CalculateItemPricesAsync(dto));
        Assert.Equal("MISSING_REQUIRED_SLOT", ex.ErrorCode);
    }

    [Fact]
    public async Task CalculateItemPricesAsync_UnknownSlotId_ThrowsInvalidSlot()
    {
        var boxType = TestHelpers.CreateTestBoxType();
        var slot = TestHelpers.CreateTestSlot(boxType.Id, "test-watch", isRequired: false);
        _db.BoxTypes.Add(boxType);
        _db.BoxSlots.Add(slot);

        var product = TestHelpers.CreateTestProduct(category: "test-watch", price: 100m);
        _db.Products.Add(product);
        await _db.SaveChangesAsync();

        var json = "{\"slots\": {\"" + Guid.NewGuid() + "\": \"" + product.Id + "\"}}";
        var dto = new List<CreateOrderItemDto>
        {
            new() { BoxTypeId = boxType.Id, Quantity = 1, CustomDataJson = json }
        };

        var ex = await Assert.ThrowsAsync<BadRequestException>(() => _service.CalculateItemPricesAsync(dto));
        Assert.Equal("INVALID_SLOT", ex.ErrorCode);
    }
}
