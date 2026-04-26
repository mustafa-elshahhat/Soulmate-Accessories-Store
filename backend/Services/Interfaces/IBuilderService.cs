using SoulmateStore.DTOs.Builder;
using SoulmateStore.Models.Enums;

namespace SoulmateStore.Services.Interfaces;

public interface IBuilderService
{
    Task<List<BoxTypeDto>> GetBoxTypesAsync();
    Task<List<BoxSlotDto>> GetSlotsAsync(Guid boxTypeId);
    Task<List<SlotProductDto>> GetProductsForSlotAsync(string slotKey, Gender? filterGender);
    Task<List<SlotProductDto>> GetProductsForSlotByIdAsync(Guid slotId);
    Task<PreviewResponseDto> PreviewAsync(PreviewRequestDto dto);
}
