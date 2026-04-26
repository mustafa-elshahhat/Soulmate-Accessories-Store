using SoulmateStore.DTOs.Common;
using SoulmateStore.DTOs.Products;

namespace SoulmateStore.Services.Interfaces;

public interface IProductService
{
    Task<PaginatedResponse<ProductResponseDto>> GetAllAsync(int page, int limit, string? search, string? sort, string? order, string? gender, string? category, int? minRating = null, decimal? minPrice = null, decimal? maxPrice = null);
    Task<PaginatedResponse<ProductResponseDto>> GetAllAdminAsync(int page, int limit, string? search);
    Task<ProductResponseDto> GetBySlugAsync(string slug);
    Task<List<ProductResponseDto>> GetRelatedAsync(string slug, int limit);
    Task<ProductResponseDto> GetByIdAsync(Guid id);
    Task<ProductResponseDto> CreateAsync(CreateProductDto dto);
    Task<ProductResponseDto> UpdateAsync(Guid id, UpdateProductDto dto);
    Task DeleteAsync(Guid id);
}
