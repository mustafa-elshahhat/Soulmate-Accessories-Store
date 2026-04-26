using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using SoulmateStore.Data;
using SoulmateStore.Models;
using SoulmateStore.Models.Enums;

namespace SoulmateStore.Tests;

public static class TestHelpers
{
    public static AppDbContext CreateInMemoryContext(string? dbName = null)
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(dbName ?? Guid.NewGuid().ToString())
            .ConfigureWarnings(x => x.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.InMemoryEventId.TransactionIgnoredWarning))
            .Options;

        var context = new AppDbContext(options);
        context.Database.EnsureCreated();
        return context;
    }

    public static IConfiguration CreateTestConfiguration(Dictionary<string, string?>? overrides = null)
    {
        var defaults = new Dictionary<string, string?>
        {
            ["Jwt:Secret"] = "ThisIsAVeryLongTestSecretKeyForJwtTokens1234567890!",
            ["Jwt:Issuer"] = "SoulmateStoreTest",
            ["Jwt:Audience"] = "SoulmateStoreTestAudience",
            ["Jwt:AccessTokenExpiresInMinutes"] = "15",
            ["Jwt:RefreshTokenExpiresInDays"] = "7",
            ["Jwt:AdminRefreshTokenExpiresInHours"] = "24",
            ["FrontendUrl"] = "http://localhost:4200",
            ["Shipping:Cost"] = "50",
            ["Payment:MaxAttempts"] = "3",
            ["Payment:VodafoneCashNumber"] = "01000000000",
            ["Payment:InstaPayNumber"] = "01100000000",
        };

        if (overrides is not null)
        {
            foreach (var kv in overrides)
                defaults[kv.Key] = kv.Value;
        }

        return new ConfigurationBuilder()
            .AddInMemoryCollection(defaults)
            .Build();
    }

    public static User CreateTestUser(string? email = null, UserRole? role = null)
    {
        return new User
        {
            Id = Guid.NewGuid(),
            Name = "Test User",
            Email = email ?? $"test-{Guid.NewGuid():N}@example.com",
            Phone = "01012345678",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("TestPassword123"),
            Role = role ?? UserRole.Customer,
            CreatedAt = DateTime.UtcNow,
        };
    }

    public static Address CreateTestAddress(Guid userId, Guid? governorateId = null)
    {
        return new Address
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Label = "المنزل",
            GovernorateId = governorateId ?? Guid.NewGuid(),
            Street = "شارع التحرير",
            Building = "15",
            Floor = "3",
            Apartment = "5",
            Phone = "01012345678",
            Lat = 30.0444,
            Lng = 31.2357,
            IsDefault = true,
        };
    }

    public static Product CreateTestProduct(string? category = null, Gender? gender = null, decimal price = 100m)
    {
        return new Product
        {
            Id = Guid.NewGuid(),
            Name = $"Test Product {Guid.NewGuid().ToString("N")[..6]}",
            Slug = $"test-product-{Guid.NewGuid().ToString("N")[..6]}",
            Description = "Test product description",
            Price = price,
            ImageUrl = "https://example.com/image.jpg",
            Category = category ?? "watch",
            Gender = gender ?? Gender.Male,
            IsActive = true,
            IsStandalone = true,
            IsBuilderItem = category is not null,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };
    }

    public static BoxType CreateTestBoxType(decimal basePrice = 200m)
    {
        return new BoxType
        {
            Id = Guid.NewGuid(),
            Name = "Test Box",
            Slug = $"test-box-{Guid.NewGuid().ToString("N")[..6]}",
            Gender = Gender.Male,
            BasePrice = basePrice,
            ImageUrl = "https://example.com/box.jpg",
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };
    }

    public static BoxSlot CreateTestSlot(Guid boxTypeId, string slotKey = "perfume", bool isRequired = true, int sortOrder = 1)
    {
        return new BoxSlot
        {
            Id = Guid.NewGuid(),
            BoxTypeId = boxTypeId,
            SlotKey = slotKey,
            LabelAr = "عطر",
            IsRequired = isRequired,
            SortOrder = sortOrder,
        };
    }

    public static Order CreateTestOrder(Guid userId, Guid addressId, OrderStatus? status = null)
    {
        return new Order
        {
            Id = Guid.NewGuid(),
            OrderNumber = $"ORD-{DateTime.UtcNow:yyyyMMdd}-{Random.Shared.Next(1000, 9999)}",
            UserId = userId,
            Status = status ?? OrderStatus.Pending,
            TotalPrice = 350m,
            ShippingCost = 50m,
            AddressId = addressId,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            OrderItems = [],
        };
    }

    public static ILogger<T> CreateLogger<T>()
    {
        return new LoggerFactory().CreateLogger<T>();
    }
}
