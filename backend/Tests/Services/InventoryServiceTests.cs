using Microsoft.EntityFrameworkCore;
using SoulmateStore.Data;
using SoulmateStore.Exceptions;
using SoulmateStore.Models;
using SoulmateStore.Services.Implementations;
using SoulmateStore.Tests.Helpers;
using Xunit;

namespace SoulmateStore.Tests.Services;

public class InventoryServiceTests
{
    private readonly AppDbContext _db;
    private readonly InventoryService _service;

    public InventoryServiceTests()
    {
        _db = TestHelpers.CreateInMemoryContext();
        var logger = TestHelpers.CreateLogger<InventoryService>();
        _service = new InventoryService(_db, logger);
    }

    [Fact]
    public async Task CheckAndDecrementStockAsync_StandaloneProduct_DecrementsCorrectly()
    {
        // Arrange
        var product = TestHelpers.CreateTestProduct();
        product.StockQuantity = 10;
        _db.Products.Add(product);
        await _db.SaveChangesAsync();

        var items = new List<OrderItem>
        {
            new() { ProductId = product.Id, Quantity = 3 }
        };

        // Act
        await _service.CheckAndDecrementStockAsync(items);

        // Assert
        var updatedProduct = await _db.Products.FindAsync(product.Id);
        Assert.NotNull(updatedProduct);
        Assert.Equal(7, updatedProduct.StockQuantity);
    }

    [Fact]
    public async Task CheckAndDecrementStockAsync_ProductInBoxSlots_DecrementsCorrectly()
    {
        // Arrange
        var p1 = TestHelpers.CreateTestProduct();
        p1.StockQuantity = 5;
        _db.Products.Add(p1);
        await _db.SaveChangesAsync();

        var items = new List<OrderItem>
        {
            new() 
            { 
                BoxTypeId = Guid.NewGuid(), 
                Quantity = 2, 
                CustomDataJson = "{\"slots\": {\"watch\": \"" + p1.Id + "\"}}" 
            }
        };

        // Act
        await _service.CheckAndDecrementStockAsync(items);

        // Assert
        var updatedProduct = await _db.Products.FindAsync(p1.Id);
        Assert.NotNull(updatedProduct);
        Assert.Equal(3, updatedProduct.StockQuantity); // 5 - (2 boxes * 1 per box)
    }

    [Fact]
    public async Task RestoreStockAsync_RestoresCorrectly()
    {
        // Arrange
        var product = TestHelpers.CreateTestProduct();
        product.StockQuantity = 10;
        _db.Products.Add(product);
        await _db.SaveChangesAsync();

        var items = new List<OrderItem>
        {
            new() { ProductId = product.Id, Quantity = 5 }
        };

        // Act
        await _service.RestoreStockAsync(items);

        // Assert
        var updatedProduct = await _db.Products.FindAsync(product.Id);
        Assert.NotNull(updatedProduct);
        Assert.Equal(15, updatedProduct.StockQuantity);
    }

    [Fact]
    public async Task CheckAndDecrementStockAsync_InsufficientStock_ThrowsConflictException()
    {
        // Arrange
        var product = TestHelpers.CreateTestProduct();
        product.StockQuantity = 2;
        _db.Products.Add(product);
        await _db.SaveChangesAsync();

        var items = new List<OrderItem>
        {
            new() { ProductId = product.Id, Quantity = 5 }
        };

        // Act & Assert
        var ex = await Assert.ThrowsAsync<ConflictException>(() => _service.CheckAndDecrementStockAsync(items));
        Assert.Equal("INSUFFICIENT_STOCK", ex.ErrorCode);
    }
}
