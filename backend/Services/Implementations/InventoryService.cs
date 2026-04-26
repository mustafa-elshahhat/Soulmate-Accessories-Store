using Microsoft.EntityFrameworkCore;
using SoulmateStore.Data;
using SoulmateStore.Exceptions;
using SoulmateStore.Models;
using SoulmateStore.Services.Interfaces;

namespace SoulmateStore.Services.Implementations;

public class InventoryService : IInventoryService
{
    private readonly AppDbContext _db;
    private readonly ILogger<InventoryService> _logger;

    public InventoryService(AppDbContext db, ILogger<InventoryService> logger)
    {
        _db = db;
        _logger = logger;
    }

    public async Task CheckAndDecrementStockAsync(List<OrderItem> items)
    {
        var productQuantities = AggregateProductQuantities(items);
        if (productQuantities.Count == 0) return;

        var productIds = productQuantities.Keys.ToList();
        
        var products = await _db.Products
            .Where(p => productIds.Contains(p.Id))
            .ToListAsync();

        foreach (var pq in productQuantities)
        {
            var product = products.FirstOrDefault(p => p.Id == pq.Key);
            if (product == null)
                throw new NotFoundException("PRODUCT_NOT_FOUND", $"المنتج {pq.Key} مش موجود");

            if (!product.IsActive)
                throw new ConflictException("PRODUCT_INACTIVE", $"المنتج '{product.Name}' غير متاح حالياً");

            if (product.StockQuantity < pq.Value)
            {
                _logger.LogWarning("Insufficient stock for product {ProductName} ({ProductId}). Available: {Available}, Requested: {Requested}", 
                    product.Name, product.Id, product.StockQuantity, pq.Value);
                throw new ConflictException("INSUFFICIENT_STOCK", $"المنتج '{product.Name}' غير متاح بالكمية المطلوبة. المتاح: {product.StockQuantity}");
            }

            product.StockQuantity -= pq.Value;
            product.UpdatedAt = DateTime.UtcNow;
        }

        await _db.SaveChangesAsync();
    }

    public async Task RestoreStockAsync(List<OrderItem> items)
    {
        var productQuantities = AggregateProductQuantities(items);
        if (productQuantities.Count == 0) return;

        var productIds = productQuantities.Keys.ToList();
        
        var products = await _db.Products
            .Where(p => productIds.Contains(p.Id))
            .ToListAsync();

        foreach (var pq in productQuantities)
        {
            var product = products.FirstOrDefault(p => p.Id == pq.Key);
            if (product != null)
            {
                product.StockQuantity += pq.Value;
                product.UpdatedAt = DateTime.UtcNow;
            }
        }

        await _db.SaveChangesAsync();
    }

    private Dictionary<Guid, int> AggregateProductQuantities(List<OrderItem> items)
    {
        var productQuantities = new Dictionary<Guid, int>();

        foreach (var item in items)
        {
            // Standalone product
            if (item.ProductId.HasValue)
            {
                var pid = item.ProductId.Value;
                if (!productQuantities.ContainsKey(pid)) productQuantities[pid] = 0;
                productQuantities[pid] += item.Quantity;
            }

            // Box slots
            if (item.BoxTypeId.HasValue && !string.IsNullOrWhiteSpace(item.CustomDataJson))
            {
                try
                {
                    using var doc = System.Text.Json.JsonDocument.Parse(item.CustomDataJson);
                    if (doc.RootElement.TryGetProperty("slots", out var slotsEl))
                    {
                        foreach (var slot in slotsEl.EnumerateObject())
                        {
                            if (Guid.TryParse(slot.Value.GetString(), out var productId))
                            {
                                if (!productQuantities.ContainsKey(productId)) productQuantities[productId] = 0;
                                // Quantity here is multiplied by the box quantity
                                productQuantities[productId] += item.Quantity;
                            }
                        }
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Failed to parse box slots for stock decrement");
                }
            }
        }

        return productQuantities;
    }
}
