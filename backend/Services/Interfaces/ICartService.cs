using SoulmateStore.DTOs.Cart;

namespace SoulmateStore.Services.Interfaces;

public interface ICartService
{
    Task<CartResponseDto> GetAsync(Guid userId);
    Task<CartResponseDto> SaveAsync(Guid userId, SaveCartDto dto);
    Task ClearAsync(Guid userId);
}
