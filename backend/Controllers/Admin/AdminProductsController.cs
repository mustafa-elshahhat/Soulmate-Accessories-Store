using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OutputCaching;
using Microsoft.AspNetCore.RateLimiting;
using SoulmateStore.DTOs.Common;
using SoulmateStore.DTOs.Products;
using SoulmateStore.Services.Interfaces;

namespace SoulmateStore.Controllers.Admin;

[ApiController]
[Route("api/admin/products")]
[Authorize(Roles = "admin")]
[EnableRateLimiting("Admin")]
public class AdminProductsController : ControllerBase
{
    private readonly IProductService _products;
    private readonly IOutputCacheStore _cache;

    public AdminProductsController(IProductService products, IOutputCacheStore cache)
    {
        _products = products;
        _cache = cache;
    }

    [HttpGet]
    public async Task<ActionResult<PaginatedResponse<ProductResponseDto>>> GetProducts(
        [FromQuery] int page = 1,
        [FromQuery] int limit = 50,
        [FromQuery] string? search = null)
    {
        if (page < 1) page = 1;
        if (limit < 1 || limit > 100) limit = 50;

        var result = await _products.GetAllAdminAsync(page, limit, search);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ApiResponse<ProductResponseDto>>> GetProduct(Guid id)
    {
        var product = await _products.GetByIdAsync(id);
        return Ok(new ApiResponse<ProductResponseDto> { Data = product });
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<ProductResponseDto>>> CreateProduct([FromBody] CreateProductDto dto)
    {
        var product = await _products.CreateAsync(dto);
        await _cache.EvictByTagAsync("products", default);
        return CreatedAtAction(nameof(GetProduct), new { id = product.Id },
            new ApiResponse<ProductResponseDto> { Data = product });
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<ApiResponse<ProductResponseDto>>> UpdateProduct(Guid id, [FromBody] UpdateProductDto dto)
    {
        var product = await _products.UpdateAsync(id, dto);
        await _cache.EvictByTagAsync("products", default);
        return Ok(new ApiResponse<ProductResponseDto> { Data = product });
    }

    [HttpDelete("{id:guid}")]
    public async Task<ActionResult<ApiResponse<object>>> DeleteProduct(Guid id)
    {
        await _products.DeleteAsync(id);
        await _cache.EvictByTagAsync("products", default);
        return Ok(new ApiResponse<object> { Message = "تم حذف المنتج" });
    }
}
