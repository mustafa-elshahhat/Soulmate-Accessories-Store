using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using SoulmateStore.Data;
using SoulmateStore.DTOs.Cart;
using SoulmateStore.Models;
using SoulmateStore.Services.Interfaces;

namespace SoulmateStore.Services.Implementations;

public class CartService : ICartService
{
    private readonly AppDbContext _db;
    private readonly ILogger<CartService> _logger;

    public CartService(AppDbContext db, ILogger<CartService> logger)
    {
        _db = db;
        _logger = logger;
    }

    public async Task<CartResponseDto> GetAsync(Guid userId)
    {
        var cart = await _db.Carts.FirstOrDefaultAsync(c => c.UserId == userId);
        if (cart == null)
            return new CartResponseDto { ItemsJson = "[]", UpdatedAt = DateTime.UtcNow };

        return new CartResponseDto { ItemsJson = cart.ItemsJson, UpdatedAt = cart.UpdatedAt };
    }

    public async Task<CartResponseDto> SaveAsync(Guid userId, SaveCartDto dto)
    {
        var cart = await _db.Carts.FirstOrDefaultAsync(c => c.UserId == userId);

        if (cart == null)
        {
            cart = new Cart
            {
                UserId = userId,
                ItemsJson = dto.ItemsJson,
                UpdatedAt = DateTime.UtcNow,
            };
            _db.Carts.Add(cart);
        }
        else
        {
            cart.ItemsJson = dto.ItemsJson;
            cart.UpdatedAt = DateTime.UtcNow;
        }

        await _db.SaveChangesAsync();
        _logger.LogInformation("Cart saved for user {UserId}", userId);

        return new CartResponseDto { ItemsJson = cart.ItemsJson, UpdatedAt = cart.UpdatedAt };
    }

    public async Task ClearAsync(Guid userId)
    {
        var cart = await _db.Carts.FirstOrDefaultAsync(c => c.UserId == userId);
        if (cart != null)
        {
            cart.ItemsJson = "[]";
            cart.UpdatedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();
        }

        _logger.LogInformation("Cart cleared for user {UserId}", userId);
    }
}
