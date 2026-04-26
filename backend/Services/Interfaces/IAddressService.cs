using SoulmateStore.DTOs.Addresses;

namespace SoulmateStore.Services.Interfaces;

public interface IAddressService
{
    Task<List<AddressResponseDto>> GetByUserAsync(Guid userId);
    Task<AddressResponseDto> CreateAsync(Guid userId, CreateAddressDto dto);
    Task<AddressResponseDto> UpdateAsync(Guid id, Guid userId, CreateAddressDto dto);
    Task DeleteAsync(Guid id, Guid userId);
}
