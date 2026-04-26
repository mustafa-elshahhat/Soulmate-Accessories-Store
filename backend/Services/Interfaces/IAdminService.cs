using SoulmateStore.DTOs.Admin;
using SoulmateStore.DTOs.Common;

namespace SoulmateStore.Services.Interfaces;

public interface IAdminService
{
    Task<DashboardDto> GetDashboardAsync();
    Task<PaginatedResponse<AdminOrderListDto>> GetOrdersAsync(int page, int limit, string? status, string? search);
    Task<AdminOrderDetailDto> GetOrderByIdAsync(Guid id);
    Task<PaginatedResponse<AdminUserDto>> GetUsersAsync(int page, int limit);
    Task<AnalyticsDto> GetAnalyticsAsync();
    Task<List<AdminBoxTypeListDto>> GetBoxTypesAsync();
    Task<AdminBoxTypeDetailDto> GetBoxTypeByIdAsync(Guid id);
    Task<Guid> CreateBoxTypeAsync(CreateBoxTypeDto dto);
    Task UpdateBoxTypeAsync(Guid id, CreateBoxTypeDto dto);
    Task DeleteBoxTypeAsync(Guid id);
    Task<Guid> CreateSlotAsync(Guid boxTypeId, CreateSlotDto dto);
    Task UpdateSlotAsync(Guid boxTypeId, Guid slotId, CreateSlotDto dto);
    Task DeleteSlotAsync(Guid boxTypeId, Guid slotId);
    Task<List<CategoryCustomizationPriceDto>> GetCustomizationPricesAsync();
    Task UpsertCustomizationPriceAsync(UpsertCustomizationPriceDto dto);
    Task DeleteCustomizationPriceAsync(Guid id);
}
