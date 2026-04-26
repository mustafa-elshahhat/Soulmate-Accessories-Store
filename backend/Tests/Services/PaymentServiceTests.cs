using FluentAssertions;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Moq;
using SoulmateStore.Data;
using SoulmateStore.Exceptions;
using SoulmateStore.Models;
using SoulmateStore.Models.Enums;
using SoulmateStore.Services.Implementations;
using SoulmateStore.Services.Interfaces;
using SoulmateStore.Tests.Helpers;
using Microsoft.AspNetCore.Http;

namespace SoulmateStore.Tests.Services;

public class PaymentServiceTests : IDisposable
{
    private readonly AppDbContext _db;
    private readonly Mock<IUploadService> _mockUpload;
    private readonly Mock<INotificationService> _mockNotifications;
    private readonly Mock<IBackgroundNotificationQueue> _mockBgQueue;
    private readonly PaymentService _service;
    private readonly Guid _userId = Guid.NewGuid();
    private readonly Guid _addressId = Guid.NewGuid();

    public PaymentServiceTests()
    {
        _db = TestDbContextFactory.Create();

        var config = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["Payment:MaxAttempts"] = "3",
                ["Payment:VodafoneCashNumber"] = "01012345678",
                ["Payment:InstaPayNumber"] = "01098765432"
            })
            .Build();

        _mockUpload = new Mock<IUploadService>();
        _mockUpload.Setup(u => u.UploadImageAsync(It.IsAny<IFormFile>()))
            .ReturnsAsync("https://cloudinary.com/screenshot.jpg");

        _mockNotifications = new Mock<INotificationService>();
        _mockBgQueue = new Mock<IBackgroundNotificationQueue>();
        var logger = new Mock<ILogger<PaymentService>>();

        _service = new PaymentService(_db, _mockUpload.Object, _mockNotifications.Object, _mockBgQueue.Object, config, logger.Object);

        SeedData();
    }

    private void SeedData()
    {
        _db.Users.Add(new User
        {
            Id = _userId,
            Name = "Test",
            Email = "pay@test.com",
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
            Street = "Street",
            Building = "1",
            Floor = "1",
            Phone = "01012345678",
            Lat = 30, Lng = 31
        });

        _db.SaveChanges();
    }

    public void Dispose()
    {
        _db.Dispose();
        GC.SuppressFinalize(this);
    }

    private Order CreatePendingOrder(string orderNumber = "ORD-PAY-1")
    {
        var order = new Order
        {
            OrderNumber = orderNumber,
            UserId = _userId,
            Status = OrderStatus.Pending,
            TotalPrice = 300,
            ShippingCost = 50,
            AddressId = _addressId,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        _db.Orders.Add(order);
        _db.SaveChanges();
        return order;
    }

    private static IFormFile CreateMockFile()
    {
        var mockFile = new Mock<IFormFile>();
        mockFile.Setup(f => f.FileName).Returns("receipt.jpg");
        mockFile.Setup(f => f.Length).Returns(1024);
        return mockFile.Object;
    }

    // --- UploadReceipt Tests ---

    [Fact]
    public async Task UploadReceipt_PendingOrder_Succeeds()
    {
        var order = CreatePendingOrder();

        var result = await _service.UploadReceiptAsync(order.Id, _userId, PaymentMethod.VodafoneCash, CreateMockFile());

        result.Should().NotBeNull();
        result.Status.Should().Be(PaymentStatus.Pending);
        result.AttemptNumber.Should().Be(1);
        result.Method.Should().Be(PaymentMethod.VodafoneCash);
        result.ScreenshotUrl.Should().Be("https://cloudinary.com/screenshot.jpg");
    }

    [Fact]
    public async Task UploadReceipt_ChangesOrderStatus_ToPaymentReview()
    {
        var order = CreatePendingOrder();

        await _service.UploadReceiptAsync(order.Id, _userId, PaymentMethod.VodafoneCash, CreateMockFile());

        var updated = _db.Orders.First(o => o.Id == order.Id);
        updated.Status.Should().Be(OrderStatus.PaymentReview);
    }

    [Fact]
    public async Task UploadReceipt_NonPendingOrder_ThrowsConflict()
    {
        var order = CreatePendingOrder("ORD-NP");
        order.Status = OrderStatus.Processing;
        await _db.SaveChangesAsync();

        var act = () => _service.UploadReceiptAsync(order.Id, _userId, PaymentMethod.VodafoneCash, CreateMockFile());

        await act.Should().ThrowAsync<ConflictException>()
            .Where(e => e.ErrorCode == "INVALID_STATUS");
    }

    [Fact]
    public async Task UploadReceipt_OtherUsersOrder_ThrowsNotFound()
    {
        var order = CreatePendingOrder("ORD-OTH");

        var act = () => _service.UploadReceiptAsync(order.Id, Guid.NewGuid(), PaymentMethod.VodafoneCash, CreateMockFile());

        await act.Should().ThrowAsync<NotFoundException>();
    }

    [Fact]
    public async Task UploadReceipt_IncrementsAttemptNumber()
    {
        var order = CreatePendingOrder("ORD-ATT");

        await _service.UploadReceiptAsync(order.Id, _userId, PaymentMethod.VodafoneCash, CreateMockFile());

        // Reset order to pending for next attempt
        order.Status = OrderStatus.Pending;
        await _db.SaveChangesAsync();

        var result = await _service.UploadReceiptAsync(order.Id, _userId, PaymentMethod.InstaPay, CreateMockFile());

        result.AttemptNumber.Should().Be(2);
    }

    [Fact]
    public async Task UploadReceipt_MaxAttemptsExceeded_ThrowsConflict()
    {
        var order = CreatePendingOrder("ORD-MAX");

        _db.Payments.Add(new Payment
        {
            OrderId = order.Id,
            Method = PaymentMethod.VodafoneCash,
            ScreenshotUrl = "url",
            Status = PaymentStatus.Rejected,
            AttemptNumber = 3,
            CreatedAt = DateTime.UtcNow
        });
        await _db.SaveChangesAsync();

        var act = () => _service.UploadReceiptAsync(order.Id, _userId, PaymentMethod.VodafoneCash, CreateMockFile());

        await act.Should().ThrowAsync<ConflictException>()
            .Where(e => e.ErrorCode == "MAX_ATTEMPTS");
    }

    // --- Verify Tests ---

    [Fact]
    public async Task Verify_SetsPaymentVerifiedAndOrderProcessing()
    {
        var order = CreatePendingOrder("ORD-VER");
        order.Status = OrderStatus.PaymentReview;
        var user = _db.Users.First(u => u.Id == _userId);
        order.User = user;

        var payment = new Payment
        {
            OrderId = order.Id,
            Method = PaymentMethod.VodafoneCash,
            ScreenshotUrl = "url",
            Status = PaymentStatus.Pending,
            AttemptNumber = 1,
            CreatedAt = DateTime.UtcNow,
            Order = order
        };
        _db.Payments.Add(payment);
        await _db.SaveChangesAsync();

        await _service.VerifyAsync(payment.Id, "Looks good");

        payment.Status.Should().Be(PaymentStatus.Verified);
        payment.AdminNote.Should().Be("Looks good");
        order.Status.Should().Be(OrderStatus.Processing);
    }

    [Fact]
    public async Task Verify_SendsNotificationAndEmail()
    {
        var order = CreatePendingOrder("ORD-VN");
        order.Status = OrderStatus.PaymentReview;
        var user = _db.Users.First(u => u.Id == _userId);
        order.User = user;

        var payment = new Payment { OrderId = order.Id, Method = PaymentMethod.VodafoneCash, ScreenshotUrl = "u", Status = PaymentStatus.Pending, AttemptNumber = 1, CreatedAt = DateTime.UtcNow, Order = order };
        _db.Payments.Add(payment);
        await _db.SaveChangesAsync();

        await _service.VerifyAsync(payment.Id, null);

        _mockNotifications.Verify(n => n.CreateAsync(_userId, It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(), order.Id), Times.AtLeastOnce);
        _mockBgQueue.Verify(q => q.EnqueueAsync(It.IsAny<Func<IServiceProvider, CancellationToken, Task>>()), Times.AtLeastOnce);
    }

    // --- Reject Tests ---

    [Fact]
    public async Task Reject_SetsPaymentRejectedAndOrderPending()
    {
        var order = CreatePendingOrder("ORD-REJ");
        order.Status = OrderStatus.PaymentReview;
        var user = _db.Users.First(u => u.Id == _userId);
        order.User = user;

        var payment = new Payment { OrderId = order.Id, Method = PaymentMethod.VodafoneCash, ScreenshotUrl = "u", Status = PaymentStatus.Pending, AttemptNumber = 1, CreatedAt = DateTime.UtcNow, Order = order };
        _db.Payments.Add(payment);
        await _db.SaveChangesAsync();

        await _service.RejectAsync(payment.Id, "Blurry image");

        payment.Status.Should().Be(PaymentStatus.Rejected);
        payment.AdminNote.Should().Be("Blurry image");
        order.Status.Should().Be(OrderStatus.Pending);
    }

    [Fact]
    public async Task Reject_SendsNotificationAndEmail()
    {
        var order = CreatePendingOrder("ORD-RN");
        order.Status = OrderStatus.PaymentReview;
        var user = _db.Users.First(u => u.Id == _userId);
        order.User = user;

        var payment = new Payment { OrderId = order.Id, Method = PaymentMethod.VodafoneCash, ScreenshotUrl = "u", Status = PaymentStatus.Pending, AttemptNumber = 1, CreatedAt = DateTime.UtcNow, Order = order };
        _db.Payments.Add(payment);
        await _db.SaveChangesAsync();

        await _service.RejectAsync(payment.Id, "Bad receipt");

        _mockNotifications.Verify(n => n.CreateAsync(_userId, It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(), order.Id), Times.AtLeastOnce);
        _mockBgQueue.Verify(q => q.EnqueueAsync(It.IsAny<Func<IServiceProvider, CancellationToken, Task>>()), Times.AtLeastOnce);
    }

    [Fact]
    public async Task Reject_NonExistentPayment_ThrowsNotFound()
    {
        var act = () => _service.RejectAsync(Guid.NewGuid(), "reason");

        await act.Should().ThrowAsync<NotFoundException>()
            .Where(e => e.ErrorCode == "PAYMENT_NOT_FOUND");
    }

    // --- GetPaymentInfo Tests ---

    [Fact]
    public async Task GetPaymentInfo_ReturnsConfiguredNumbers()
    {
        var result = await _service.GetPaymentInfoAsync();

        result.VodafoneCashNumber.Should().Be("01012345678");
        result.InstaPayNumber.Should().Be("01098765432");
    }

    // --- GetByOrder Tests ---

    [Fact]
    public async Task GetByOrder_ReturnsLatestPayment()
    {
        var order = CreatePendingOrder("ORD-GBO");

        _db.Payments.Add(new Payment { OrderId = order.Id, Method = PaymentMethod.VodafoneCash, ScreenshotUrl = "u1", Status = PaymentStatus.Rejected, AttemptNumber = 1, CreatedAt = DateTime.UtcNow });
        _db.Payments.Add(new Payment { OrderId = order.Id, Method = PaymentMethod.VodafoneCash, ScreenshotUrl = "u2", Status = PaymentStatus.Pending, AttemptNumber = 2, CreatedAt = DateTime.UtcNow });
        await _db.SaveChangesAsync();

        var result = await _service.GetByOrderAsync(order.Id, _userId);

        result.Should().NotBeNull();
        result!.AttemptNumber.Should().Be(2);
    }

    [Fact]
    public async Task GetByOrder_NoPayment_ReturnsNull()
    {
        var order = CreatePendingOrder("ORD-NOP");

        var result = await _service.GetByOrderAsync(order.Id, _userId);

        result.Should().BeNull();
    }
}
