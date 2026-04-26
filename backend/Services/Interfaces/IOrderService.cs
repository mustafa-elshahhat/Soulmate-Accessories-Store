using SoulmateStore.DTOs.Common;
using SoulmateStore.DTOs.Orders;
using SoulmateStore.Models.Enums;

namespace SoulmateStore.Services.Interfaces;

public interface IOrderService
{
    Task<OrderPreviewDto> PreviewAsync(CreateOrderDto dto, Guid userId);
    Task<OrderResponseDto> CreateAsync(CreateOrderDto dto, Guid userId);
    Task<PaginatedResponse<OrderResponseDto>> GetMyOrdersAsync(Guid userId, int page, int limit);
    Task<OrderResponseDto> GetByIdAsync(Guid id, Guid userId);
    Task CancelAsync(Guid id, Guid userId);
    Task<PaginatedResponse<OrderResponseDto>> GetAllAsync(int page, int limit, string? status);
    Task UpdateStatusAsync(Guid id, OrderStatus status, string? adminNote);
}
