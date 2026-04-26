using FluentAssertions;
using Microsoft.Extensions.Logging.Abstractions;
using SoulmateStore.Data;
using SoulmateStore.DTOs.Builder;
using SoulmateStore.Exceptions;
using SoulmateStore.Models;
using SoulmateStore.Models.Enums;
using SoulmateStore.Services.Implementations;
using SoulmateStore.Tests.Helpers;

namespace SoulmateStore.Tests.Services;

public class BuilderServiceTests : IDisposable
{
    private readonly AppDbContext _db;
    private readonly BuilderService _service;

    public BuilderServiceTests()
    {
        _db = TestDbContextFactory.Create();
        _service = new BuilderService(_db, new NullLogger<BuilderService>());
    }

    public void Dispose()
    {
        _db.Dispose();
        GC.SuppressFinalize(this);
    }

    // --- GetBoxTypes Tests ---

    [Fact]
    public async Task GetBoxTypes_ReturnsOnlyActiveBoxTypes()
    {
        // Deactivate all seeded box types first
        foreach (var bt in _db.BoxTypes.ToList())
            bt.IsActive = false;

        _db.BoxTypes.AddRange(
            new BoxType { Name = "Active", Slug = "active", Gender = Gender.Male, BasePrice = 100, ImageUrl = "url", IsActive = true, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new BoxType { Name = "Inactive", Slug = "inactive", Gender = Gender.Female, BasePrice = 200, ImageUrl = "url", IsActive = false, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow }
        );
        await _db.SaveChangesAsync();

        var result = await _service.GetBoxTypesAsync();

        result.Should().ContainSingle();
        result[0].Name.Should().Be("Active");
    }

    [Fact]
    public async Task GetBoxTypes_ReturnsOrderedByName()
    {
        _db.BoxTypes.AddRange(
            new BoxType { Name = "Zeta", Slug = "zeta", Gender = Gender.Male, BasePrice = 100, ImageUrl = "url", IsActive = true, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new BoxType { Name = "Alpha", Slug = "alpha", Gender = Gender.Female, BasePrice = 200, ImageUrl = "url", IsActive = true, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow }
        );
        await _db.SaveChangesAsync();

        var result = await _service.GetBoxTypesAsync();

        result[0].Name.Should().Be("Alpha");
        result[1].Name.Should().Be("Zeta");
    }

    // --- GetSlots Tests ---

    [Fact]
    public async Task GetSlots_ReturnsSlots_ForActiveBoxType()
    {
        var boxType = new BoxType { Name = "Box", Slug = "box", Gender = Gender.Male, BasePrice = 100, ImageUrl = "url", IsActive = true, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow };
        _db.BoxTypes.Add(boxType);

        _db.BoxSlots.AddRange(
            new BoxSlot { BoxTypeId = boxType.Id, SlotKey = "perfume", LabelAr = "عطر", IsRequired = true, SortOrder = 1 },
            new BoxSlot { BoxTypeId = boxType.Id, SlotKey = "watch", LabelAr = "ساعة", IsRequired = false, SortOrder = 2 }
        );
        await _db.SaveChangesAsync();

        var result = await _service.GetSlotsAsync(boxType.Id);

        result.Should().HaveCount(2);
        result[0].SlotKey.Should().Be("perfume");
        result[1].SlotKey.Should().Be("watch");
    }

    [Fact]
    public async Task GetSlots_OrderedBySortOrder()
    {
        var boxType = new BoxType { Name = "Box", Slug = "box-sort", Gender = Gender.Male, BasePrice = 100, ImageUrl = "url", IsActive = true, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow };
        _db.BoxTypes.Add(boxType);

        _db.BoxSlots.AddRange(
            new BoxSlot { BoxTypeId = boxType.Id, SlotKey = "second", LabelAr = "ثاني", IsRequired = false, SortOrder = 2 },
            new BoxSlot { BoxTypeId = boxType.Id, SlotKey = "first", LabelAr = "أول", IsRequired = true, SortOrder = 1 }
        );
        await _db.SaveChangesAsync();

        var result = await _service.GetSlotsAsync(boxType.Id);

        result[0].SortOrder.Should().Be(1);
        result[1].SortOrder.Should().Be(2);
    }

    [Fact]
    public async Task GetSlots_InactiveBoxType_ThrowsNotFound()
    {
        var boxType = new BoxType { Name = "Inactive", Slug = "inactive-box", Gender = Gender.Male, BasePrice = 100, ImageUrl = "url", IsActive = false, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow };
        _db.BoxTypes.Add(boxType);
        await _db.SaveChangesAsync();

        var act = () => _service.GetSlotsAsync(boxType.Id);

        await act.Should().ThrowAsync<NotFoundException>()
            .Where(e => e.ErrorCode == "BOX_TYPE_NOT_FOUND");
    }

    [Fact]
    public async Task GetSlots_NonExistentBoxType_ThrowsNotFound()
    {
        var act = () => _service.GetSlotsAsync(Guid.NewGuid());

        await act.Should().ThrowAsync<NotFoundException>();
    }

    // --- GetProductsForSlot Tests ---

    [Fact]
    public async Task GetProductsForSlot_ReturnsMatchingProducts()
    {
        _db.Products.AddRange(
            new Product { Name = "P1", Slug = "p1", Description = "d", Price = 100, ImageUrl = "u", Category = "watch", Gender = Gender.Male, IsActive = true, IsBuilderItem = true, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new Product { Name = "P2", Slug = "p2", Description = "d", Price = 200, ImageUrl = "u", Category = "wallet", Gender = Gender.Male, IsActive = true, IsBuilderItem = true, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow }
        );
        await _db.SaveChangesAsync();

        var result = await _service.GetProductsForSlotAsync("watch", null);

        result.Should().ContainSingle();
        result[0].Name.Should().Be("P1");
    }

    [Fact]
    public async Task GetProductsForSlot_FiltersByGender()
    {
        _db.Products.AddRange(
            new Product { Name = "Male", Slug = "male", Description = "d", Price = 100, ImageUrl = "u", Category = "watch", Gender = Gender.Male, IsActive = true, IsBuilderItem = true, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new Product { Name = "Female", Slug = "female", Description = "d", Price = 200, ImageUrl = "u", Category = "watch", Gender = Gender.Female, IsActive = true, IsBuilderItem = true, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow }
        );
        await _db.SaveChangesAsync();

        var result = await _service.GetProductsForSlotAsync("watch", Gender.Male);

        result.Should().ContainSingle();
        result[0].Name.Should().Be("Male");
    }

    [Fact]
    public async Task GetProductsForSlot_ExcludesInactiveProducts()
    {
        _db.Products.Add(new Product { Name = "Inactive", Slug = "inactive", Description = "d", Price = 100, ImageUrl = "u", Category = "watch", Gender = Gender.Male, IsActive = false, IsBuilderItem = true, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow });
        await _db.SaveChangesAsync();

        var result = await _service.GetProductsForSlotAsync("watch", null);

        result.Should().BeEmpty();
    }

    // --- Preview Tests ---

    [Fact]
    public async Task Preview_CalculatesTotalPrice_BoxBasePlusPrdoucts()
    {
        var boxType = new BoxType { Name = "Box", Slug = "box-prev", Gender = Gender.Male, BasePrice = 150, ImageUrl = "url", IsActive = true, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow };
        _db.BoxTypes.Add(boxType);

        var slot1 = new BoxSlot { BoxTypeId = boxType.Id, SlotKey = "watch", LabelAr = "ساعة", IsRequired = true, SortOrder = 1 };
        var slot2 = new BoxSlot { BoxTypeId = boxType.Id, SlotKey = "wallet", LabelAr = "محفظة", IsRequired = false, SortOrder = 2 };
        _db.BoxSlots.AddRange(slot1, slot2);

        var prod1 = new Product { Name = "Watch X", Slug = "wx", Description = "d", Price = 100, ImageUrl = "u", Category = "watch", Gender = Gender.Male, IsActive = true, IsBuilderItem = true, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow };
        var prod2 = new Product { Name = "Wallet Y", Slug = "wy", Description = "d", Price = 250, ImageUrl = "u", Category = "wallet", Gender = Gender.Male, IsActive = true, IsBuilderItem = true, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow };
        _db.Products.AddRange(prod1, prod2);
        await _db.SaveChangesAsync();

        var dto = new PreviewRequestDto
        {
            BoxTypeId = boxType.Id,
            Slots = new Dictionary<string, Guid>
            {
                [slot1.Id.ToString()] = prod1.Id,
                [slot2.Id.ToString()] = prod2.Id
            },
            Customization = new CustomizationDto { Name1 = "Ali", Name2 = "Sara" }
        };

        var result = await _service.PreviewAsync(dto);

        result.TotalPrice.Should().Be(500); // 150 + 100 + 250
        result.BoxType.Name.Should().Be("Box");
        result.BoxType.BasePrice.Should().Be(150);
        result.SelectedProducts.Should().HaveCount(2);
        result.Customization!.Name1.Should().Be("Ali");
    }

    [Fact]
    public async Task Preview_InactiveBoxType_ThrowsNotFound()
    {
        var boxType = new BoxType { Name = "Inactive", Slug = "inactive-prev", Gender = Gender.Male, BasePrice = 100, ImageUrl = "url", IsActive = false, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow };
        _db.BoxTypes.Add(boxType);
        await _db.SaveChangesAsync();

        var dto = new PreviewRequestDto { BoxTypeId = boxType.Id, Slots = new() };

        var act = () => _service.PreviewAsync(dto);

        await act.Should().ThrowAsync<NotFoundException>();
    }

    [Fact]
    public async Task Preview_InvalidProduct_ThrowsNotFound()
    {
        var boxType = new BoxType { Name = "Box", Slug = "box-inv", Gender = Gender.Male, BasePrice = 100, ImageUrl = "url", IsActive = true, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow };
        _db.BoxTypes.Add(boxType);

        var slot = new BoxSlot { BoxTypeId = boxType.Id, SlotKey = "perfume", LabelAr = "عطر", IsRequired = true, SortOrder = 1 };
        _db.BoxSlots.Add(slot);
        await _db.SaveChangesAsync();

        var dto = new PreviewRequestDto
        {
            BoxTypeId = boxType.Id,
            Slots = new Dictionary<string, Guid> { [slot.Id.ToString()] = Guid.NewGuid() }
        };

        var act = () => _service.PreviewAsync(dto);

        await act.Should().ThrowAsync<NotFoundException>()
            .Where(e => e.ErrorCode == "PRODUCT_NOT_FOUND");
    }
}
