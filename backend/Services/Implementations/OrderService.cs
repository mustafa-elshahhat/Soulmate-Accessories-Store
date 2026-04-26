using Microsoft.EntityFrameworkCore;
using SoulmateStore.Data;
using SoulmateStore.DTOs.Common;
using SoulmateStore.DTOs.Orders;
using SoulmateStore.Exceptions;
using SoulmateStore.Models;
using SoulmateStore.Models.Enums;
using SoulmateStore.Services.Interfaces;

namespace SoulmateStore.Services.Implementations;

public class OrderService : IOrderService
{
    private readonly AppDbContext _db;
    private readonly IOrderPricingService _pricing;
    private readonly IInventoryService _inventory;
    private readonly IOrderNotificationService _orderNotifications;
    private readonly ICouponService _coupons;
    private readonly ILogger<OrderService> _logger;

    public OrderService(
        AppDbContext db,
        IOrderPricingService pricing,
        IInventoryService inventory,
        IOrderNotificationService orderNotifications,
        ICouponService coupons,
        ILogger<OrderService> logger)
    {
        _db = db;
        _pricing = pricing;
        _inventory = inventory;
        _orderNotifications = orderNotifications;
        _coupons = coupons;
        _logger = logger;
    }

    public async Task<OrderPreviewDto> PreviewAsync(CreateOrderDto dto, Guid userId)
    {
        var address = await _db.Addresses.Include(a => a.Governorate)
            .AsNoTracking()
            .FirstOrDefaultAsync(a => a.Id == dto.AddressId && a.UserId == userId)
            ?? throw new NotFoundException("ADDRESS_NOT_FOUND", "العنوان مش موجود");

        var shippingCost = address.Governorate.ShippingCost;
        var (items, totalPrice) = await _pricing.CalculateItemPricesAsync(dto.Items);

        return new OrderPreviewDto
        {
            Items = items.Select(i => new OrderPreviewItemDto
            {
                ProductId = i.ProductId,
                BoxTypeId = i.BoxTypeId,
                Quantity = i.Quantity,
                UnitPrice = i.UnitPrice,
                ProductName = i.Product?.Name ?? i.BoxType?.Name
            }).ToList(),
            TotalPrice = totalPrice,
            ShippingCost = shippingCost,
            GrandTotal = totalPrice + shippingCost
        };
    }

    public async Task<OrderResponseDto> CreateAsync(CreateOrderDto dto, Guid userId)
    {
        // 1. Idempotency and basic validation
        var recentCutoff = DateTime.UtcNow.AddSeconds(-30);
        var hasDuplicate = await _db.Orders
            .AnyAsync(o => o.UserId == userId && o.CreatedAt > recentCutoff && o.Status == OrderStatus.Pending);
        if (hasDuplicate)
            throw new ConflictException("DUPLICATE_ORDER", "تم إنشاء طلب مؤخرا. يرجى الانتظار.");

        var address = await _db.Addresses.Include(a => a.Governorate)
            .AsNoTracking()
            .FirstOrDefaultAsync(a => a.Id == dto.AddressId && a.UserId == userId)
            ?? throw new NotFoundException("ADDRESS_NOT_FOUND", "العنوان مش موجود");

        var user = await _db.Users.FindAsync(userId) 
            ?? throw new NotFoundException("USER_NOT_FOUND", "المستخدم مش موجود");

        var shippingCost = address.Governorate.ShippingCost;
        var orderNumber = await GenerateOrderNumberAsync();

        Microsoft.EntityFrameworkCore.Storage.IDbContextTransaction? transaction = null;
        if (_db.Database.ProviderName == null || !_db.Database.ProviderName.Contains("InMemory"))
        {
            transaction = await _db.Database.BeginTransactionAsync();
        }

        try
        {
            var (orderItems, totalPrice) = await _pricing.CalculateItemPricesAsync(dto.Items);

            decimal discountAmount = 0;
            string? couponCode = null;
            if (!string.IsNullOrWhiteSpace(dto.CouponCode))
            {
                var couponResult = await _coupons.ValidateAsync(dto.CouponCode, totalPrice);
                if (couponResult.Valid)
                {
                    discountAmount = couponResult.DiscountAmount;
                    couponCode = couponResult.Code;
                }
            }

            await _inventory.CheckAndDecrementStockAsync(orderItems);

            if (couponCode != null)
            {
                await _coupons.IncrementUsageAsync(couponCode);
            }

            var order = new Order
            {
                OrderNumber = orderNumber,
                UserId = userId,
                Status = OrderStatus.Pending,
                TotalPrice = totalPrice - discountAmount,
                ShippingCost = shippingCost,
                CouponCode = couponCode,
                DiscountAmount = discountAmount,
                AddressId = dto.AddressId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                OrderItems = orderItems
            };

            _db.Orders.Add(order);
            await _db.SaveChangesAsync();

            if (transaction != null)
            {
                await transaction.CommitAsync();
            }

            await _orderNotifications.NotifyOrderCreatedAsync(order, user);

            _logger.LogInformation("Order created: {OrderNumber} by {UserId}", orderNumber, userId);
            return await GetByIdInternalAsync(order.Id);
        }
        catch (Exception ex)
        {
            if (transaction != null)
            {
                await transaction.RollbackAsync();
            }
            _logger.LogError(ex, "Failed to create order for user {UserId}", userId);
            throw;
        }
        finally
        {
            if (transaction != null)
            {
                await transaction.DisposeAsync();
            }
        }
    }

    public async Task<PaginatedResponse<OrderResponseDto>> GetMyOrdersAsync(Guid userId, int page, int limit)
    {
        var query = _db.Orders
            .AsNoTracking()
            .Where(o => o.UserId == userId)
            .OrderByDescending(o => o.CreatedAt);

        var total = await query.CountAsync();
        var items = await query
            .Skip((page - 1) * limit)
            .Take(limit)
            .Include(o => o.OrderItems)
            .Select(o => MapToDto(o, null))
            .ToListAsync();

        return new PaginatedResponse<OrderResponseDto>
        {
            Data = items,
            Meta = new PaginationMeta
            {
                Page = page,
                Limit = limit,
                Total = total,
                TotalPages = (int)Math.Ceiling(total / (double)limit)
            }
        };
    }

    public async Task<OrderResponseDto> GetByIdAsync(Guid id, Guid userId)
    {
        var order = await _db.Orders
            .AsNoTracking()
            .Include(o => o.OrderItems)
            .Include(o => o.Address)
                .ThenInclude(a => a.Governorate)
            .FirstOrDefaultAsync(o => o.Id == id && o.UserId == userId)
            ?? throw new NotFoundException("ORDER_NOT_FOUND", "الطلب مش موجود");

        var payment = await _db.Payments
            .AsNoTracking()
            .Where(p => p.OrderId == id)
            .OrderByDescending(p => p.AttemptNumber)
            .FirstOrDefaultAsync();

        return MapToDto(order, payment);
    }

    public async Task CancelAsync(Guid id, Guid userId)
    {
        var order = await _db.Orders
            .Include(o => o.OrderItems)
            .Include(o => o.User)
            .FirstOrDefaultAsync(o => o.Id == id && o.UserId == userId)
            ?? throw new NotFoundException("ORDER_NOT_FOUND", "الطلب مش موجود");

        if (order.Status != OrderStatus.Pending)
            throw new ConflictException("CANNOT_CANCEL", "مش ممكن إلغاء الطلب ده. الحالة الحالية: " + order.Status);

        Microsoft.EntityFrameworkCore.Storage.IDbContextTransaction? transaction = null;
        if (_db.Database.ProviderName == null || !_db.Database.ProviderName.Contains("InMemory"))
        {
            transaction = await _db.Database.BeginTransactionAsync();
        }

        try
        {
            order.Status = OrderStatus.Cancelled;
            order.CancelReason = "تم الإلغاء بواسطة العميل";
            order.UpdatedAt = DateTime.UtcNow;

            await _inventory.RestoreStockAsync(order.OrderItems.ToList());

            await _db.SaveChangesAsync();
            if (transaction != null)
            {
                await transaction.CommitAsync();
            }

            await _orderNotifications.NotifyStatusChangedAsync(order, order.User, OrderStatus.Cancelled);
        }
        catch (Exception ex)
        {
            if (transaction != null)
            {
                await transaction.RollbackAsync();
            }
            _logger.LogError(ex, "Failed to cancel order {OrderId}", id);
            throw;
        }
        finally
        {
            if (transaction != null)
            {
                await transaction.DisposeAsync();
            }
        }
    }

    public async Task<PaginatedResponse<OrderResponseDto>> GetAllAsync(int page, int limit, string? status)
    {
        var query = _db.Orders.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(status) && Enum.TryParse<OrderStatus>(status.Replace("_", ""), true, out var statusEnum))
            query = query.Where(o => o.Status == statusEnum);

        query = query.OrderByDescending(o => o.CreatedAt);

        var total = await query.CountAsync();
        var items = await query
            .Skip((page - 1) * limit)
            .Take(limit)
            .Include(o => o.OrderItems)
            .Select(o => MapToDto(o, null))
            .ToListAsync();

        return new PaginatedResponse<OrderResponseDto>
        {
            Data = items,
            Meta = new PaginationMeta
            {
                Page = page,
                Limit = limit,
                Total = total,
                TotalPages = (int)Math.Ceiling(total / (double)limit)
            }
        };
    }

    public async Task UpdateStatusAsync(Guid id, OrderStatus status, string? adminNote)
    {
        var order = await _db.Orders
            .Include(o => o.OrderItems)
            .Include(o => o.User)
            .FirstOrDefaultAsync(o => o.Id == id)
            ?? throw new NotFoundException("ORDER_NOT_FOUND", "الطلب مش موجود");

        ValidateStatusTransition(order.Status, status);

        Microsoft.EntityFrameworkCore.Storage.IDbContextTransaction? transaction = null;
        if (_db.Database.ProviderName == null || !_db.Database.ProviderName.Contains("InMemory"))
        {
            transaction = await _db.Database.BeginTransactionAsync();
        }

        try
        {
            var oldStatus = order.Status;
            order.Status = status;
            
            var sanitizedNote = Helpers.InputSanitizer.StripHtml(adminNote);
            if (adminNote is not null) order.AdminNote = sanitizedNote;
            if (status == OrderStatus.Cancelled && adminNote is not null)
                order.CancelReason = sanitizedNote;
            
            order.UpdatedAt = DateTime.UtcNow;

            // If cancelled by admin, restore stock
            if (status == OrderStatus.Cancelled && oldStatus != OrderStatus.Cancelled)
            {
                await _inventory.RestoreStockAsync(order.OrderItems.ToList());
            }

            await _db.SaveChangesAsync();
            if (transaction != null)
            {
                await transaction.CommitAsync();
            }

            // Notify
            await _orderNotifications.NotifyStatusChangedAsync(order, order.User, status);
        }
        catch (Exception ex)
        {
            if (transaction != null)
            {
                await transaction.RollbackAsync();
            }
            _logger.LogError(ex, "Failed to update order status for {OrderId}", id);
            throw;
        }
        finally
        {
            if (transaction != null)
            {
                await transaction.DisposeAsync();
            }
        }
    }

    private static void ValidateStatusTransition(OrderStatus currentStatus, OrderStatus newStatus)
    {
        if (newStatus == OrderStatus.Cancelled)
            return; // can cancel from any status

        var allowed = new Dictionary<OrderStatus, OrderStatus[]>
        {
            [OrderStatus.Pending] = [OrderStatus.Cancelled],
            [OrderStatus.PaymentReview] = [OrderStatus.Processing, OrderStatus.Cancelled],
            [OrderStatus.Processing] = [OrderStatus.Shipped, OrderStatus.Cancelled],
            [OrderStatus.Shipped] = [OrderStatus.Delivered, OrderStatus.Cancelled],
        };

        if (!allowed.TryGetValue(currentStatus, out var validTransitions) || !validTransitions.Contains(newStatus))
            throw new ConflictException("INVALID_TRANSITION", $"مش ممكن تغيير الحالة من {currentStatus} إلى {newStatus}");
    }

    private async Task<OrderResponseDto> GetByIdInternalAsync(Guid id)
    {
        var order = await _db.Orders
            .Include(o => o.OrderItems)
                .ThenInclude(i => i.Product)
            .Include(o => o.OrderItems)
                .ThenInclude(i => i.BoxType)
            .Include(o => o.Address)
                .ThenInclude(a => a.Governorate)
            .FirstAsync(o => o.Id == id);

        return MapToDto(order);
    }

    private async Task<string> GenerateOrderNumberAsync()
    {
        var date = DateTime.UtcNow.ToString("yyyyMMdd");
        for (var attempt = 0; attempt < 10; attempt++)
        {
            var random = Random.Shared.Next(1000, 9999);
            var orderNumber = $"ORD-{date}-{random}";
            if (!await _db.Orders.AnyAsync(o => o.OrderNumber == orderNumber))
                return orderNumber;
        }
        return $"ORD-{date}-{Guid.NewGuid().ToString()[..8]}";
    }

    private static OrderResponseDto MapToDto(Order o, Payment? payment = null) => new()
    {
        Id = o.Id,
        OrderNumber = o.OrderNumber,
        Status = o.Status,
        TotalPrice = o.TotalPrice,
        ShippingCost = o.ShippingCost,
        CouponCode = o.CouponCode,
        DiscountAmount = o.DiscountAmount,
        CancelReason = o.CancelReason,
        AdminNote = o.AdminNote,
        CreatedAt = o.CreatedAt,
        UpdatedAt = o.UpdatedAt,
        Items = o.OrderItems.Select(i => new OrderItemResponseDto
        {
            Id = i.Id,
            ProductId = i.ProductId,
            BoxTypeId = i.BoxTypeId,
            Quantity = i.Quantity,
            UnitPrice = i.UnitPrice,
            CustomDataJson = i.CustomDataJson,
            ProductName = i.Product?.Name ?? i.BoxType?.Name,
            ProductNameEn = i.Product?.NameEn ?? i.BoxType?.NameEn
        }).ToList(),
        ShippingAddress = o.Address is not null ? new OrderAddressDto
        {
            Label = o.Address.Label,
            GovernorateName = o.Address.Governorate?.Name ?? "",
            GovernorateNameEn = o.Address.Governorate?.NameEn ?? "",
            City = o.Address.City,
            District = o.Address.District,
            Street = o.Address.Street,
            Building = o.Address.Building,
            Floor = o.Address.Floor,
            Apartment = o.Address.Apartment,
            Phone = o.Address.Phone,
            Lat = o.Address.Lat,
            Lng = o.Address.Lng
        } : null,
        Payment = payment is not null ? new OrderPaymentDto
        {
            Status = payment.Status,
            Method = payment.Method,
            ScreenshotUrl = payment.ScreenshotUrl
        } : null
    };
}
