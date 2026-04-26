using FluentAssertions;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Moq;
using SoulmateStore.Data;
using SoulmateStore.DTOs.Orders;
using SoulmateStore.Exceptions;
using SoulmateStore.Models;
using SoulmateStore.Models.Enums;
using SoulmateStore.Services.Implementations;
using SoulmateStore.Services.Interfaces;
using SoulmateStore.Tests.Helpers;

namespace SoulmateStore.Tests.Services;

public class OrderServiceTests : IDisposable
{
    private readonly AppDbContext _db;
    private readonly Mock<IOrderPricingService> _mockPricing;
    private readonly Mock<IInventoryService> _mockInventory;
    private readonly Mock<IOrderNotificationService> _mockOrderNotifications;
    private readonly Mock<ICouponService> _mockCoupons;
    private readonly OrderService _service;
    private readonly Guid _userId = Guid.NewGuid();
    private readonly Guid _addressId = Guid.NewGuid();

    public OrderServiceTests()
    {
        _db = TestDbContextFactory.Create();

        var config = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["Shipping:Cost"] = "50"
            })
            .Build();

        _mockPricing = new Mock<IOrderPricingService>();
        _mockInventory = new Mock<IInventoryService>();
        _mockOrderNotifications = new Mock<IOrderNotificationService>();
        _mockCoupons = new Mock<ICouponService>();
        var logger = new Mock<ILogger<OrderService>>();

        _service = new OrderService(_db, _mockPricing.Object, _mockInventory.Object, _mockOrderNotifications.Object, _mockCoupons.Object, logger.Object);

        SeedUserAndAddress();
    }

    private void SeedUserAndAddress()
    {
        _db.Users.Add(new User
        {
            Id = _userId,
            Name = "Test Customer",
            Email = "customer@test.com",
            Phone = "01012345678",
            PasswordHash = "hash",
            Role = UserRole.Customer,
            CreatedAt = DateTime.UtcNow
        });

        var govId = Guid.NewGuid();
        _db.Governorates.Add(new Governorate { Id = govId, Name = "القاهرة", ShippingCost = 50, IsActive = true });

        _db.Addresses.Add(new Address
        {
            Id = _addressId,
            UserId = _userId,
            Label = "Home",
            GovernorateId = govId,
            Street = "Test Street",
            Building = "10",
            Floor = "3",
            Phone = "01012345678",
            Lat = 30.0,
            Lng = 31.0
        });

        _db.SaveChanges();
    }

    public void Dispose()
    {
        _db.Dispose();
        GC.SuppressFinalize(this);
    }

    // --- Create Order Tests ---

    [Fact]
    public async Task Create_StandaloneProduct_CalculatesTotalCorrectly()
    {
        var product = new Product
        {
            Name = "Test Product",
            Slug = "test-product",
            Description = "desc",
            Price = 200,
            ImageUrl = "url",
            Category = "watch",
            Gender = Gender.Male,
            IsActive = true,
            IsStandalone = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        _db.Products.Add(product);
        await _db.SaveChangesAsync();

        var dto = new CreateOrderDto
        {
            AddressId = _addressId,
            Items = [new CreateOrderItemDto { ProductId = product.Id, Quantity = 2 }]
        };
        
        _mockPricing.Setup(p => p.CalculateItemPricesAsync(It.IsAny<List<CreateOrderItemDto>>()))
            .ReturnsAsync((new List<OrderItem> { new OrderItem { ProductId = product.Id, Quantity = 2, UnitPrice = 200 } }, 400));

        var result = await _service.CreateAsync(dto, _userId);

        result.TotalPrice.Should().Be(400); // 200 * 2
        result.ShippingCost.Should().Be(50);
        result.Status.Should().Be(OrderStatus.Pending);
        result.Items.Should().HaveCount(1);
    }

    [Fact]
    public async Task Create_BoxOrder_CalculatesBasePricePlusProducts()
    {
        var boxType = new BoxType
        {
            Name = "For Him",
            Slug = "for-him",
            Gender = Gender.Male,
            BasePrice = 150,
            ImageUrl = "url",
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        _db.BoxTypes.Add(boxType);

        var product1 = new Product { Name = "P1", Slug = "p1", Description = "d", Price = 100, ImageUrl = "u", Category = "wallet", Gender = Gender.Male, IsActive = true, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow };
        var product2 = new Product { Name = "P2", Slug = "p2", Description = "d", Price = 50, ImageUrl = "u", Category = "watch", Gender = Gender.Male, IsActive = true, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow };
        _db.Products.AddRange(product1, product2);
        await _db.SaveChangesAsync();

        var customData = $"{{\"slots\":{{\"slot1\":\"{product1.Id}\",\"slot2\":\"{product2.Id}\"}}}}";
        var dto = new CreateOrderDto
        {
            AddressId = _addressId,
            Items = [new CreateOrderItemDto { BoxTypeId = boxType.Id, Quantity = 1, CustomDataJson = customData }]
        };

        _mockPricing.Setup(p => p.CalculateItemPricesAsync(It.IsAny<List<CreateOrderItemDto>>()))
            .ReturnsAsync((new List<OrderItem> { new OrderItem { BoxTypeId = boxType.Id, Quantity = 1, UnitPrice = 300, CustomDataJson = customData } }, 300));

        var result = await _service.CreateAsync(dto, _userId);

        result.TotalPrice.Should().Be(300); // 150 base + 100 + 50
    }

    [Fact]
    public async Task Create_BoxOrder_WithCustomizedSlot_IncludesCustomizationFee()
    {
        var boxType = new BoxType
        {
            Id = Guid.NewGuid(),
            Name = "Box",
            BasePrice = 100,
            IsActive = true,
            BoxSlots = new List<BoxSlot> { new BoxSlot { SlotKey = "watch", LabelAr = "ساعة", IsRequired = true } }
        };
        _db.BoxTypes.Add(boxType);

        var product = new Product { Id = Guid.NewGuid(), Name = "Watch", Price = 200, Category = "watch", IsActive = true, IsCustomizable = true };
        _db.Products.Add(product);

        // Add customization price for 'watch' category
        _db.CategoryCustomizationPrices.Add(new CategoryCustomizationPrice { Category = "watch", Price = 50 });
        await _db.SaveChangesAsync();

        // customized_slots (snake_case)
        var customData = $"{{\"slots\":{{\"watch\":\"{product.Id}\"}},\"customized_slots\":[\"watch\"]}}";
        var dto = new CreateOrderDto
        {
            AddressId = _addressId,
            Items = [new CreateOrderItemDto { BoxTypeId = boxType.Id, Quantity = 1, CustomDataJson = customData }]
        };

        // We need to setup pricing mock to simulate backend calculation
        // Total = 100 (base) + 200 (product) + 50 (customization) = 350
        _mockPricing.Setup(p => p.CalculateItemPricesAsync(It.IsAny<List<CreateOrderItemDto>>()))
            .ReturnsAsync((new List<OrderItem> { new OrderItem { BoxTypeId = boxType.Id, Quantity = 1, UnitPrice = 350, CustomDataJson = customData } }, 350));

        var result = await _service.CreateAsync(dto, _userId);

        result.TotalPrice.Should().Be(350);
    }

    [Fact]
    public async Task Create_WithInvalidAddress_ThrowsNotFound()
    {
        var dto = new CreateOrderDto
        {
            AddressId = Guid.NewGuid(),
            Items = [new CreateOrderItemDto { ProductId = Guid.NewGuid(), Quantity = 1 }]
        };

        var act = () => _service.CreateAsync(dto, _userId);

        await act.Should().ThrowAsync<NotFoundException>()
            .Where(e => e.ErrorCode == "ADDRESS_NOT_FOUND");
    }

    [Fact]
    public async Task Create_WithOtherUsersAddress_ThrowsNotFound()
    {
        var otherUserId = Guid.NewGuid();
        _db.Users.Add(new User { Id = otherUserId, Name = "Other", Email = "other@test.com", Phone = "01099999999", PasswordHash = "h", Role = UserRole.Customer, CreatedAt = DateTime.UtcNow });
        var otherAddr = new Address { UserId = otherUserId, Label = "Other", GovernorateId = _db.Governorates.First().Id, Street = "S", Building = "B", Floor = "F", Phone = "01099999999", Lat = 0, Lng = 0 };
        _db.Addresses.Add(otherAddr);
        await _db.SaveChangesAsync();

        var dto = new CreateOrderDto
        {
            AddressId = otherAddr.Id,
            Items = [new CreateOrderItemDto { ProductId = Guid.NewGuid(), Quantity = 1 }]
        };

        var act = () => _service.CreateAsync(dto, _userId);

        await act.Should().ThrowAsync<NotFoundException>();
    }

    [Fact]
    public async Task Create_SendsNotifications()
    {
        var product = new Product
        {
            Name = "Test", Slug = "t", Description = "d", Price = 100, ImageUrl = "u",
            Category = "watch", Gender = Gender.Male, IsActive = true, IsStandalone = true,
            CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow
        };
        _db.Products.Add(product);
        await _db.SaveChangesAsync();

        var dto = new CreateOrderDto
        {
            AddressId = _addressId,
            Items = [new CreateOrderItemDto { ProductId = product.Id, Quantity = 1 }]
        };

        // Setup pricing
        _mockPricing.Setup(p => p.CalculateItemPricesAsync(It.IsAny<List<CreateOrderItemDto>>()))
            .ReturnsAsync((new List<OrderItem> { new OrderItem { ProductId = product.Id, Quantity = 1, UnitPrice = 100 } }, 100));

        await _service.CreateAsync(dto, _userId);

        _mockOrderNotifications.Verify(n => n.NotifyOrderCreatedAsync(It.IsAny<Order>(), It.IsAny<User>()), Times.Once);
    }

    // --- GetMyOrders Tests ---

    [Fact]
    public async Task GetMyOrders_ReturnsOnlyUserOrders()
    {
        var otherUserId = Guid.NewGuid();
        _db.Users.Add(new User { Id = otherUserId, Name = "Other", Email = "other2@test.com", Phone = "01099999999", PasswordHash = "h", Role = UserRole.Customer, CreatedAt = DateTime.UtcNow });

        _db.Orders.Add(new Order { OrderNumber = "ORD-1", UserId = _userId, Status = OrderStatus.Pending, TotalPrice = 100, ShippingCost = 50, AddressId = _addressId, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow });
        _db.Orders.Add(new Order { OrderNumber = "ORD-2", UserId = otherUserId, Status = OrderStatus.Pending, TotalPrice = 200, ShippingCost = 50, AddressId = _addressId, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow });
        await _db.SaveChangesAsync();

        var result = await _service.GetMyOrdersAsync(_userId, 1, 10);

        result.Data.Should().HaveCount(1);
        result.Data[0].OrderNumber.Should().Be("ORD-1");
    }

    [Fact]
    public async Task GetMyOrders_Pagination_Works()
    {
        for (int i = 0; i < 5; i++)
        {
            _db.Orders.Add(new Order { OrderNumber = $"ORD-{i}", UserId = _userId, Status = OrderStatus.Pending, TotalPrice = 100, ShippingCost = 50, AddressId = _addressId, CreatedAt = DateTime.UtcNow.AddMinutes(-i), UpdatedAt = DateTime.UtcNow });
        }
        await _db.SaveChangesAsync();

        var result = await _service.GetMyOrdersAsync(_userId, 1, 2);

        result.Data.Should().HaveCount(2);
        result.Meta.Total.Should().Be(5);
        result.Meta.TotalPages.Should().Be(3);
    }

    // --- Cancel Tests ---

    [Fact]
    public async Task Cancel_PendingOrder_Succeeds()
    {
        var order = new Order { OrderNumber = "ORD-CAN", UserId = _userId, Status = OrderStatus.Pending, TotalPrice = 100, ShippingCost = 50, AddressId = _addressId, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow };
        _db.Orders.Add(order);
        await _db.SaveChangesAsync();

        await _service.CancelAsync(order.Id, _userId);

        var updated = _db.Orders.First(o => o.Id == order.Id);
        updated.Status.Should().Be(OrderStatus.Cancelled);
    }

    [Fact]
    public async Task Cancel_NonPendingOrder_ThrowsConflict()
    {
        var order = new Order { OrderNumber = "ORD-SHIP", UserId = _userId, Status = OrderStatus.Shipped, TotalPrice = 100, ShippingCost = 50, AddressId = _addressId, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow };
        _db.Orders.Add(order);
        await _db.SaveChangesAsync();

        var act = () => _service.CancelAsync(order.Id, _userId);

        await act.Should().ThrowAsync<ConflictException>()
            .Where(e => e.ErrorCode == "CANNOT_CANCEL");
    }

    [Fact]
    public async Task Cancel_OtherUsersOrder_ThrowsNotFound()
    {
        var order = new Order { OrderNumber = "ORD-OTH", UserId = Guid.NewGuid(), Status = OrderStatus.Pending, TotalPrice = 100, ShippingCost = 50, AddressId = _addressId, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow };
        _db.Orders.Add(order);
        await _db.SaveChangesAsync();

        var act = () => _service.CancelAsync(order.Id, _userId);

        await act.Should().ThrowAsync<NotFoundException>();
    }

    // --- Admin UpdateStatus Tests ---

    [Fact]
    public async Task UpdateStatus_ValidTransition_Succeeds()
    {
        var user = _db.Users.First(u => u.Id == _userId);
        var order = new Order { OrderNumber = "ORD-ST", UserId = _userId, Status = OrderStatus.PaymentReview, TotalPrice = 100, ShippingCost = 50, AddressId = _addressId, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow, User = user };
        _db.Orders.Add(order);
        await _db.SaveChangesAsync();

        await _service.UpdateStatusAsync(order.Id, OrderStatus.Processing, null);

        var updated = _db.Orders.First(o => o.Id == order.Id);
        updated.Status.Should().Be(OrderStatus.Processing);
    }

    [Fact]
    public async Task UpdateStatus_InvalidTransition_ThrowsConflict()
    {
        var user = _db.Users.First(u => u.Id == _userId);
        var order = new Order { OrderNumber = "ORD-INV", UserId = _userId, Status = OrderStatus.Pending, TotalPrice = 100, ShippingCost = 50, AddressId = _addressId, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow, User = user };
        _db.Orders.Add(order);
        await _db.SaveChangesAsync();

        var act = () => _service.UpdateStatusAsync(order.Id, OrderStatus.Shipped, null);

        await act.Should().ThrowAsync<ConflictException>()
            .Where(e => e.ErrorCode == "INVALID_TRANSITION");
    }

    [Fact]
    public async Task UpdateStatus_CancelFromAnyStatus_Succeeds()
    {
        var user = _db.Users.First(u => u.Id == _userId);
        var order = new Order { OrderNumber = "ORD-CANC", UserId = _userId, Status = OrderStatus.Processing, TotalPrice = 100, ShippingCost = 50, AddressId = _addressId, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow, User = user };
        _db.Orders.Add(order);
        await _db.SaveChangesAsync();

        await _service.UpdateStatusAsync(order.Id, OrderStatus.Cancelled, "Admin cancelled");

        var updated = _db.Orders.First(o => o.Id == order.Id);
        updated.Status.Should().Be(OrderStatus.Cancelled);
        updated.CancelReason.Should().Be("Admin cancelled");
    }

    [Fact]
    public async Task UpdateStatus_Shipped_SendsNotificationAndEmail()
    {
        var user = _db.Users.First(u => u.Id == _userId);
        var order = new Order { OrderNumber = "ORD-NOTF", UserId = _userId, Status = OrderStatus.Processing, TotalPrice = 100, ShippingCost = 50, AddressId = _addressId, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow, User = user };
        _db.Orders.Add(order);
        await _db.SaveChangesAsync();

        await _service.UpdateStatusAsync(order.Id, OrderStatus.Shipped, null);

        _mockOrderNotifications.Verify(n => n.NotifyStatusChangedAsync(It.IsAny<Order>(), It.IsAny<User>(), OrderStatus.Shipped), Times.Once);
    }

    // --- GetAll (Admin) Tests ---

    [Fact]
    public async Task GetAll_WithStatusFilter_ReturnsMatchingOrders()
    {
        _db.Orders.Add(new Order { OrderNumber = "ORD-P1", UserId = _userId, Status = OrderStatus.Pending, TotalPrice = 100, ShippingCost = 50, AddressId = _addressId, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow });
        _db.Orders.Add(new Order { OrderNumber = "ORD-S1", UserId = _userId, Status = OrderStatus.Shipped, TotalPrice = 200, ShippingCost = 50, AddressId = _addressId, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow });
        await _db.SaveChangesAsync();

        var result = await _service.GetAllAsync(1, 10, "pending");

        result.Data.Should().ContainSingle().Which.Status.Should().Be(OrderStatus.Pending);
    }
}
