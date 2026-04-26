using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OutputCaching;
using SoulmateStore.DTOs.Common;
using SoulmateStore.DTOs.Products;
using SoulmateStore.Services.Interfaces;

namespace SoulmateStore.Controllers;

[ApiController]
[Route("api/products")]
public class ProductsController : ControllerBase
{
    private readonly IProductService _productService;

    public ProductsController(IProductService productService)
    {
        _productService = productService;
    }

    [HttpGet]
    [OutputCache(PolicyName = "Products")]
    public async Task<ActionResult<PaginatedResponse<ProductResponseDto>>> GetAll(
        [FromQuery] int page = 1,
        [FromQuery] int limit = 20,
        [FromQuery] string? search = null,
        [FromQuery] string? sort = null,
        [FromQuery] string? order = null,
        [FromQuery] string? gender = null,
        [FromQuery] string? category = null,
        [FromQuery] int? minRating = null,
        [FromQuery] decimal? minPrice = null,
        [FromQuery] decimal? maxPrice = null)
    {
        if (page < 1) page = 1;
        if (limit < 1 || limit > 100) limit = 20;

        var result = await _productService.GetAllAsync(page, limit, search, sort, order, gender, category, minRating, minPrice, maxPrice);
        return Ok(result);
    }

    [HttpGet("{slug}")]
    [OutputCache(PolicyName = "Products")]
    public async Task<ActionResult<ApiResponse<ProductResponseDto>>> GetBySlug(string slug)
    {
        var product = await _productService.GetBySlugAsync(slug);
        return Ok(new ApiResponse<ProductResponseDto> { Data = product });
    }

    [HttpGet("{slug}/related")]
    [OutputCache(PolicyName = "Products")]
    public async Task<ActionResult<ApiResponse<List<ProductResponseDto>>>> GetRelated(string slug, [FromQuery] int limit = 4)
    {
        if (limit < 1 || limit > 12) limit = 4;
        var related = await _productService.GetRelatedAsync(slug, limit);
        return Ok(new ApiResponse<List<ProductResponseDto>> { Data = related });
    }
}
