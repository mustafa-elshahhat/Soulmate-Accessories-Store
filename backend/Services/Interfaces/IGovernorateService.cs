using SoulmateStore.DTOs.Common;

namespace SoulmateStore.Services.Interfaces;

public interface IGovernorateService
{
    Task<List<GovernorateDto>> GetActiveAsync();
    Task<List<GovernorateDto>> GetAllAsync();
    Task<GovernorateDto> UpdateAsync(Guid id, UpdateGovernorateDto dto);
}
