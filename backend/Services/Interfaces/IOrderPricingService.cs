using SoulmateStore.DTOs.Orders;
using SoulmateStore.Models;

namespace SoulmateStore.Services.Interfaces;

public interface IOrderPricingService
{
    Task<(List<OrderItem> Items, decimal TotalPrice)> CalculateItemPricesAsync(List<CreateOrderItemDto> dtoItems);
}
