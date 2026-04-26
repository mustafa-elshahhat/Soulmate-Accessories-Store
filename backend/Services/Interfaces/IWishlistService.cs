using SoulmateStore.DTOs.Wishlist;

namespace SoulmateStore.Services.Interfaces;

public interface IWishlistService
{
    Task<List<WishlistItemDto>> GetByUserAsync(Guid userId);
    Task<List<Guid>> GetProductIdsByUserAsync(Guid userId);
    Task AddAsync(Guid userId, Guid productId);
    Task RemoveAsync(Guid userId, Guid productId);
}
