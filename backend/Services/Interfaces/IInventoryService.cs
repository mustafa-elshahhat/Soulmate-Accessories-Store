using SoulmateStore.Models;

namespace SoulmateStore.Services.Interfaces;

public interface IInventoryService
{
    Task CheckAndDecrementStockAsync(List<OrderItem> items);
    Task RestoreStockAsync(List<OrderItem> items);
}
