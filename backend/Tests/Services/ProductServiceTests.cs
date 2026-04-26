using FluentAssertions;
using Microsoft.Extensions.Logging.Abstractions;
using Moq;
using SoulmateStore.Data;
using SoulmateStore.DTOs.Products;
using SoulmateStore.Exceptions;
using SoulmateStore.Models;
using SoulmateStore.Models.Enums;
using SoulmateStore.Services.Implementations;
using SoulmateStore.Services.Interfaces;
using SoulmateStore.Tests.Helpers;

namespace SoulmateStore.Tests.Services;

public class ProductServiceTests : IDisposable
{
    private readonly AppDbContext _db;
    private readonly ProductService _service;

    public ProductServiceTests()
    {
        _db = TestDbContextFactory.Create();
        _service = new ProductService(_db, new Mock<IPromotionService>().Object, new NullLogger<ProductService>());
    }

    public void Dispose()
    {
        _db.Dispose();
        GC.SuppressFinalize(this);
    }

    private async Task SeedProducts()
    {
        _db.Products.AddRange(
            new Product { Name = "Male Watch", Slug = "male-watch", Description = "Nice", Price = 200, ImageUrl = "url1", Category = "watch", Gender = Gender.Male, IsActive = true, IsStandalone = true, IsBuilderItem = true, CreatedAt = DateTime.UtcNow.AddMinutes(-1), UpdatedAt = DateTime.UtcNow },
            new Product { Name = "Female Watch", Slug = "female-watch", Description = "Pretty", Price = 350, ImageUrl = "url2", Category = "watch", Gender = Gender.Female, IsActive = true, IsStandalone = true, IsBuilderItem = true, CreatedAt = DateTime.UtcNow.AddMinutes(-2), UpdatedAt = DateTime.UtcNow },
            new Product { Name = "Female Necklace", Slug = "female-necklace", Description = "Great", Price = 100, ImageUrl = "url3", Category = "necklace", Gender = Gender.Female, IsActive = true, IsStandalone = true, IsBuilderItem = true, CreatedAt = DateTime.UtcNow.AddMinutes(-3), UpdatedAt = DateTime.UtcNow },
            new Product { Name = "Inactive Product", Slug = "inactive", Description = "Hidden", Price = 50, ImageUrl = "url4", Category = "wallet", Gender = Gender.Male, IsActive = false, IsStandalone = true, IsBuilderItem = false, CreatedAt = DateTime.UtcNow.AddMinutes(-4), UpdatedAt = DateTime.UtcNow },
            new Product { Name = "Builder Only", Slug = "builder-only", Description = "Not standalone", Price = 75, ImageUrl = "url5", Category = "mug", Gender = Gender.Male, IsActive = true, IsStandalone = false, IsBuilderItem = true, CreatedAt = DateTime.UtcNow.AddMinutes(-5), UpdatedAt = DateTime.UtcNow }
        );
        await _db.SaveChangesAsync();
    }

    // --- GetAll (Public) Tests ---

    [Fact]
    public async Task GetAll_ReturnsOnlyActiveStandaloneProducts()
    {
        await SeedProducts();

        var result = await _service.GetAllAsync(1, 10, null, null, null, null, null);

        result.Data.Should().HaveCount(3); // excludes inactive and non-standalone
        result.Data.Should().NotContain(p => p.Name == "Inactive Product");
        result.Data.Should().NotContain(p => p.Name == "Builder Only");
    }

    [Fact]
    public async Task GetAll_FiltersByGender()
    {
        await SeedProducts();

        var result = await _service.GetAllAsync(1, 10, null, null, null, "male", null);

        result.Data.Should().ContainSingle().Which.Name.Should().Be("Male Watch");
    }

    [Fact]
    public async Task GetAll_FiltersByCategory()
    {
        await SeedProducts();

        var result = await _service.GetAllAsync(1, 10, null, null, null, null, "necklace");

        result.Data.Should().ContainSingle().Which.Name.Should().Be("Female Necklace");
    }

    [Fact]
    public async Task GetAll_SearchByName()
    {
        await SeedProducts();

        var result = await _service.GetAllAsync(1, 10, "Watch", null, null, null, null);

        result.Data.Should().HaveCount(2);
    }

    [Fact]
    public async Task GetAll_SortByPriceAsc()
    {
        await SeedProducts();

        var result = await _service.GetAllAsync(1, 10, null, "price", "asc", null, null);

        result.Data.First().Price.Should().BeLessThanOrEqualTo(result.Data.Last().Price);
    }

    [Fact]
    public async Task GetAll_SortByPriceDesc()
    {
        await SeedProducts();

        var result = await _service.GetAllAsync(1, 10, null, "price", "desc", null, null);

        result.Data.First().Price.Should().BeGreaterThanOrEqualTo(result.Data.Last().Price);
    }

    [Fact]
    public async Task GetAll_Pagination_Works()
    {
        await SeedProducts();

        var result = await _service.GetAllAsync(1, 2, null, null, null, null, null);

        result.Data.Should().HaveCount(2);
        result.Meta.Total.Should().Be(3);
        result.Meta.TotalPages.Should().Be(2);
        result.Meta.Page.Should().Be(1);
    }

    // --- GetBySlug Tests ---

    [Fact]
    public async Task GetBySlug_ExistingActive_ReturnsProduct()
    {
        await SeedProducts();

        var result = await _service.GetBySlugAsync("male-watch");

        result.Name.Should().Be("Male Watch");
        result.Price.Should().Be(200);
    }

    [Fact]
    public async Task GetBySlug_Inactive_ThrowsNotFound()
    {
        await SeedProducts();

        var act = () => _service.GetBySlugAsync("inactive");

        await act.Should().ThrowAsync<NotFoundException>();
    }

    [Fact]
    public async Task GetBySlug_NonExistent_ThrowsNotFound()
    {
        var act = () => _service.GetBySlugAsync("doesnt-exist");

        await act.Should().ThrowAsync<NotFoundException>();
    }

    // --- Create (Admin) Tests ---

    [Fact]
    public async Task Create_ReturnsProduct_WithGeneratedSlug()
    {
        var dto = new CreateProductDto
        {
            Name = "New Product",
            Description = "A new product",
            Price = 300,
            ImageUrl = "url",
            Category = "watch",
            Gender = Gender.Male,
            IsStandalone = true,
            IsBuilderItem = true
        };

        var result = await _service.CreateAsync(dto);

        result.Name.Should().Be("New Product");
        result.Slug.Should().Be("new-product");
        result.Price.Should().Be(300);
        result.IsActive.Should().BeTrue();
    }

    [Fact]
    public async Task Create_DuplicateName_GeneratesUniqueSlug()
    {
        _db.Products.Add(new Product { Name = "Product", Slug = "product", Description = "d", Price = 100, ImageUrl = "u", Category = "watch", Gender = Gender.Male, IsActive = true, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow });
        await _db.SaveChangesAsync();

        var dto = new CreateProductDto
        {
            Name = "Product",
            Description = "Another product",
            Price = 200,
            ImageUrl = "url",
            Category = "watch",
            Gender = Gender.Male
        };

        var result = await _service.CreateAsync(dto);

        result.Slug.Should().Be("product-1");
    }

    // --- Update (Admin) Tests ---

    [Fact]
    public async Task Update_ChangesProductFields()
    {
        var product = new Product { Name = "Old", Slug = "old", Description = "d", Price = 100, ImageUrl = "u", Category = "mug", Gender = Gender.Male, IsActive = true, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow };
        _db.Products.Add(product);
        await _db.SaveChangesAsync();

        var dto = new UpdateProductDto
        {
            Name = "Updated",
            Description = "New desc",
            Price = 500,
            ImageUrl = "new-url",
            Category = "watch",
            Gender = Gender.Female,
            IsActive = true,
            IsStandalone = true,
            IsBuilderItem = true
        };

        var result = await _service.UpdateAsync(product.Id, dto);

        result.Name.Should().Be("Updated");
        result.Description.Should().Be("New desc");
        result.Price.Should().Be(500);
        result.Slug.Should().Be("updated");
    }

    [Fact]
    public async Task Update_NonExistent_ThrowsNotFound()
    {
        var dto = new UpdateProductDto { Name = "X", Description = "d", Price = 1, ImageUrl = "u", Category = "watch", Gender = Gender.Male };

        var act = () => _service.UpdateAsync(Guid.NewGuid(), dto);

        await act.Should().ThrowAsync<NotFoundException>();
    }

    // --- Delete (Soft) Tests ---

    [Fact]
    public async Task Delete_SetsIsActiveToFalse()
    {
        var product = new Product { Name = "Deleteme", Slug = "deleteme", Description = "d", Price = 100, ImageUrl = "u", Category = "ring", Gender = Gender.Male, IsActive = true, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow };
        _db.Products.Add(product);
        await _db.SaveChangesAsync();

        await _service.DeleteAsync(product.Id);

        var updated = _db.Products.First(p => p.Id == product.Id);
        updated.IsActive.Should().BeFalse();
    }

    [Fact]
    public async Task Delete_NonExistent_ThrowsNotFound()
    {
        var act = () => _service.DeleteAsync(Guid.NewGuid());

        await act.Should().ThrowAsync<NotFoundException>();
    }

    // --- GetAllAdmin Tests ---

    [Fact]
    public async Task GetAllAdmin_IncludesInactiveProducts()
    {
        await SeedProducts();

        var result = await _service.GetAllAdminAsync(1, 50, null);

        result.Data.Should().HaveCount(5); // all products including inactive
    }

    [Fact]
    public async Task GetAllAdmin_FiltersBySearch()
    {
        await SeedProducts();

        var result = await _service.GetAllAdminAsync(1, 50, "Inactive");

        result.Data.Should().ContainSingle().Which.Name.Should().Be("Inactive Product");
    }
}
