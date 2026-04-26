using System.Text.RegularExpressions;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using SoulmateStore.Data;
using SoulmateStore.DTOs.Admin;
using SoulmateStore.DTOs.Common;
using SoulmateStore.Exceptions;
using SoulmateStore.Models;
using SoulmateStore.Models.Enums;
using SoulmateStore.Services.Interfaces;

namespace SoulmateStore.Services.Implementations;

public partial class AdminService : IAdminService
{
    private readonly AppDbContext _db;
    private readonly ILogger<AdminService> _logger;

    public AdminService(AppDbContext db, ILogger<AdminService> logger)
    {
        _db = db;
        _logger = logger;
    }

    public async Task<DashboardDto> GetDashboardAsync()
    {
        var totalOrders = await _db.Orders.AsNoTracking().CountAsync();
        var pendingOrders = await _db.Orders.AsNoTracking().CountAsync(o => o.Status == OrderStatus.Pending);
        var paymentReview = await _db.Orders.AsNoTracking().CountAsync(o => o.Status == OrderStatus.PaymentReview);
        var totalRevenue = await _db.Orders
            .AsNoTracking()
            .Where(o => o.Status != OrderStatus.Cancelled)
            .SumAsync(o => o.TotalPrice);
        var totalProducts = await _db.Products.AsNoTracking().CountAsync(p => p.IsActive);
        var totalUsers = await _db.Users.AsNoTracking().CountAsync(u => u.Role == UserRole.Customer);

        return new DashboardDto
        {
            TotalOrders = totalOrders,
            PendingOrders = pendingOrders,
            PaymentReview = paymentReview,
            TotalRevenue = totalRevenue,
            TotalProducts = totalProducts,
            TotalUsers = totalUsers,
        };
    }

    public async Task<PaginatedResponse<AdminOrderListDto>> GetOrdersAsync(int page, int limit, string? status, string? search)
    {
        var query = _db.Orders.AsNoTracking().Include(o => o.User).Include(o => o.OrderItems).AsQueryable();

        if (!string.IsNullOrWhiteSpace(status) && Enum.TryParse<OrderStatus>(status.Replace("_", ""), true, out var statusEnum))
            query = query.Where(o => o.Status == statusEnum);

        if (!string.IsNullOrWhiteSpace(search))
            query = query.Where(o =>
                o.OrderNumber.Contains(search) ||
                o.User.Name.Contains(search) ||
                o.User.Email.Contains(search));

        query = query.OrderByDescending(o => o.CreatedAt);

        var total = await query.CountAsync();
        var items = await query
            .Skip((page - 1) * limit)
            .Take(limit)
            .Select(o => new AdminOrderListDto
            {
                Id = o.Id,
                OrderNumber = o.OrderNumber,
                Status = o.Status,
                TotalPrice = o.TotalPrice,
                ShippingCost = o.ShippingCost,
                CustomerName = o.User.Name,
                CustomerEmail = o.User.Email,
                ItemsCount = o.OrderItems.Count,
                CreatedAt = o.CreatedAt,
            })
            .ToListAsync();

        return new PaginatedResponse<AdminOrderListDto>
        {
            Data = items,
            Meta = new PaginationMeta
            {
                Page = page,
                Limit = limit,
                Total = total,
                TotalPages = (int)Math.Ceiling(total / (double)limit),
            }
        };
    }

    public async Task<AdminOrderDetailDto> GetOrderByIdAsync(Guid id)
    {
        var order = await _db.Orders
            .AsNoTracking()
            .Include(o => o.User)
            .Include(o => o.Address)
                .ThenInclude(a => a.Governorate)
            .Include(o => o.OrderItems)
                .ThenInclude(i => i.Product)
            .Include(o => o.OrderItems)
                .ThenInclude(i => i.BoxType)
            .Include(o => o.Payments)
            .FirstOrDefaultAsync(o => o.Id == id)
            ?? throw new NotFoundException("ORDER_NOT_FOUND", "الطلب مش موجود");

        return new AdminOrderDetailDto
        {
            Id = order.Id,
            OrderNumber = order.OrderNumber,
            Status = order.Status,
            TotalPrice = order.TotalPrice,
            ShippingCost = order.ShippingCost,
            CancelReason = order.CancelReason,
            AdminNote = order.AdminNote,
            CreatedAt = order.CreatedAt,
            Customer = new AdminCustomerDto
            {
                Name = order.User.Name,
                Email = order.User.Email,
                Phone = order.User.Phone,
            },
            Address = order.Address is not null ? new AdminAddressDto
            {
                Label = order.Address.Label,
                GovernorateName = order.Address.Governorate != null ? order.Address.Governorate.Name : "",
                GovernorateNameEn = order.Address.Governorate != null ? order.Address.Governorate.NameEn : "",
                City = order.Address.City,
                District = order.Address.District,
                Street = order.Address.Street,
                Building = order.Address.Building,
                Floor = order.Address.Floor,
                Phone = order.Address.Phone,
                Lat = order.Address.Lat,
                Lng = order.Address.Lng,
            } : null,
            Items = await BuildOrderItemsAsync(order.OrderItems),
            Payments = order.Payments.Select(p => new AdminPaymentDetailDto
            {
                Id = p.Id,
                Method = p.Method,
                ScreenshotUrl = p.ScreenshotUrl,
                Status = p.Status,
                AdminNote = p.AdminNote,
                AttemptNumber = p.AttemptNumber,
                CreatedAt = p.CreatedAt,
            }).ToList(),
        };
    }

    private async Task<List<AdminOrderItemDto>> BuildOrderItemsAsync(ICollection<OrderItem> orderItems)
    {
        // Parse all custom data up-front to collect IDs needed for batch loading
        var parsedItemData = new Dictionary<Guid, (HashSet<string> CustomizedSlots, Dictionary<string, Guid> Slots)>();
        var allSlotProductIds = new HashSet<Guid>();

        foreach (var item in orderItems.Where(i => i.BoxTypeId.HasValue && !string.IsNullOrEmpty(i.CustomDataJson) && i.CustomDataJson != "{}"))
        {
            try
            {
                using var doc = JsonDocument.Parse(item.CustomDataJson!);
                var root = doc.RootElement;

                var customizedSlots = new HashSet<string>();
                if (root.TryGetProperty("customized_slots", out var csEl) && csEl.ValueKind == JsonValueKind.Array)
                    foreach (var cs in csEl.EnumerateArray())
                    {
                        var v = cs.GetString();
                        if (v != null) customizedSlots.Add(v);
                    }
                if (root.TryGetProperty("customizedSlots", out var csEl2) && csEl2.ValueKind == JsonValueKind.Array)
                    foreach (var cs in csEl2.EnumerateArray())
                    {
                        var v = cs.GetString();
                        if (v != null) customizedSlots.Add(v);
                    }

                var slots = new Dictionary<string, Guid>();
                if (root.TryGetProperty("slots", out var slotsEl))
                    foreach (var slot in slotsEl.EnumerateObject())
                        if (Guid.TryParse(slot.Value.GetString(), out var pid))
                        {
                            slots[slot.Name] = pid;
                            allSlotProductIds.Add(pid);
                        }

                parsedItemData[item.Id] = (customizedSlots, slots);
            }
            catch (JsonException ex) { _logger.LogWarning(ex, "Malformed CustomDataJson for OrderItem {ItemId}", item.Id); }
        }

        // Batch load all slot products in one query
        var productsDict = allSlotProductIds.Count > 0
            ? await _db.Products.AsNoTracking().Where(p => allSlotProductIds.Contains(p.Id)).ToDictionaryAsync(p => p.Id)
            : new Dictionary<Guid, Product>();

        // Batch load customization prices for all relevant categories
        var categories = productsDict.Values.Select(p => p.Category).Distinct().ToList();
        var customizationPricesDict = categories.Count > 0
            ? await _db.CategoryCustomizationPrices
                .AsNoTracking()
                .Where(c => categories.Contains(c.Category))
                .ToDictionaryAsync(c => c.Category, c => c.Price)
            : new Dictionary<string, decimal>();

        // Batch load box slots for all box types in one query
        var boxTypeIds = parsedItemData.Keys
            .Select(id => orderItems.First(i => i.Id == id).BoxTypeId!.Value)
            .Distinct().ToList();
        var boxSlotsGrouped = boxTypeIds.Count > 0
            ? (await _db.BoxSlots.AsNoTracking().Where(s => boxTypeIds.Contains(s.BoxTypeId)).ToListAsync())
                .GroupBy(s => s.BoxTypeId)
                .ToDictionary(g => g.Key, g => g.ToDictionary(s => s.Id.ToString(), s => (s.LabelAr, s.LabelEn)))
            : new Dictionary<Guid, Dictionary<string, (string LabelAr, string LabelEn)>>();

        // Build result using pre-loaded data (no more DB queries in loop)
        var result = new List<AdminOrderItemDto>();
        foreach (var i in orderItems)
        {
            List<AdminBoxSlotProductDto>? slotProducts = null;

            if (parsedItemData.TryGetValue(i.Id, out var parsed) && i.BoxTypeId.HasValue)
            {
                slotProducts = new List<AdminBoxSlotProductDto>();
                boxSlotsGrouped.TryGetValue(i.BoxTypeId.Value, out var boxSlots);

                foreach (var (slotKey, productId) in parsed.Slots)
                {
                    if (!productsDict.TryGetValue(productId, out var product)) continue;

                    var isCustomized = parsed.CustomizedSlots.Contains(slotKey);
                    decimal customizationPrice = 0;
                    if (isCustomized)
                        customizationPricesDict.TryGetValue(product.Category, out customizationPrice);

                    var slotInfo = boxSlots?.GetValueOrDefault(slotKey);
                    slotProducts.Add(new AdminBoxSlotProductDto
                    {
                        SlotLabel = slotInfo?.LabelAr ?? slotKey,
                        SlotLabelEn = slotInfo?.LabelEn ?? slotKey,
                        ProductName = product.Name,
                        ProductNameEn = product.NameEn,
                        ProductImageUrl = product.ImageUrl,
                        ProductPrice = product.Price,
                        IsCustomized = isCustomized,
                        CustomizationPrice = customizationPrice,
                    });
                }
            }

            result.Add(new AdminOrderItemDto
            {
                Id = i.Id,
                ProductId = i.ProductId,
                BoxTypeId = i.BoxTypeId,
                ProductName = i.Product?.Name,
                ProductNameEn = i.Product?.NameEn,
                ProductImageUrl = i.Product?.ImageUrl,
                BoxTypeName = i.BoxType?.Name,
                BoxTypeNameEn = i.BoxType?.NameEn,
                Quantity = i.Quantity,
                UnitPrice = i.UnitPrice,
                CustomDataJson = i.CustomDataJson,
                SlotProducts = slotProducts,
            });
        }

        return result;
    }

    public async Task<PaginatedResponse<AdminUserDto>> GetUsersAsync(int page, int limit)
    {
        var query = _db.Users.AsNoTracking().Where(u => u.Role == UserRole.Customer).OrderByDescending(u => u.CreatedAt);
        var total = await query.CountAsync();
        var items = await query
            .Skip((page - 1) * limit)
            .Take(limit)
            .Select(u => new AdminUserDto
            {
                Id = u.Id,
                Name = u.Name,
                Email = u.Email,
                Phone = u.Phone,
                IsLocked = u.LockoutEnd != null && u.LockoutEnd > DateTime.UtcNow,
                CreatedAt = u.CreatedAt,
            })
            .ToListAsync();

        return new PaginatedResponse<AdminUserDto>
        {
            Data = items,
            Meta = new PaginationMeta
            {
                Page = page,
                Limit = limit,
                Total = total,
                TotalPages = (int)Math.Ceiling(total / (double)limit),
            }
        };
    }

    public async Task<AnalyticsDto> GetAnalyticsAsync()
    {
        var now = DateTime.UtcNow;
        var thirtyDaysAgo = now.AddDays(-30);
        var todayStart = now.Date;

        var recentOrdersQuery = _db.Orders
            .AsNoTracking()
            .Where(o => o.CreatedAt >= thirtyDaysAgo && o.Status != OrderStatus.Cancelled);

        var orderCount = await recentOrdersQuery.CountAsync();
        var revenue = await recentOrdersQuery.SumAsync(o => o.TotalPrice);
        var avgOrderValue = orderCount > 0 ? revenue / orderCount : 0;

        var todayOrders = await _db.Orders.AsNoTracking().CountAsync(o => o.CreatedAt >= todayStart);
        var pendingPayments = await _db.Orders.AsNoTracking().CountAsync(o => o.Status == OrderStatus.PaymentReview);

        var statusBreakdown = await _db.Orders
            .AsNoTracking()
            .GroupBy(o => o.Status)
            .Select(g => new StatusBreakdownDto { Status = g.Key, Count = g.Count() })
            .ToListAsync();

        var topProducts = await _db.OrderItems
            .AsNoTracking()
            .Where(oi => oi.ProductId != null && oi.Order.Status != OrderStatus.Cancelled)
            .GroupBy(oi => new { oi.ProductId, oi.Product!.Name, oi.Product!.NameEn })
            .Select(g => new TopProductDto { Name = g.Key.Name, NameEn = g.Key.NameEn, SalesCount = g.Sum(x => x.Quantity) })
            .OrderByDescending(x => x.SalesCount)
            .Take(5)
            .ToListAsync();

        return new AnalyticsDto
        {
            Last30Days = new Last30DaysDto
            {
                Revenue = revenue,
                OrderCount = orderCount,
                AvgOrderValue = avgOrderValue,
            },
            TodayOrders = todayOrders,
            PendingPayments = pendingPayments,
            StatusBreakdown = statusBreakdown,
            TopProducts = topProducts,
        };
    }

    public async Task<List<AdminBoxTypeListDto>> GetBoxTypesAsync()
    {
        return await _db.BoxTypes
            .AsNoTracking()
            .Include(b => b.BoxSlots)
            .OrderBy(b => b.Name)
            .Select(b => new AdminBoxTypeListDto
            {
                Id = b.Id,
                Name = b.Name,
                Slug = b.Slug,
                Gender = b.Gender,
                BasePrice = b.BasePrice,
                ImageUrl = b.ImageUrl,
                IsActive = b.IsActive,
                SlotsCount = b.BoxSlots.Count,
                CreatedAt = b.CreatedAt,
            })
            .ToListAsync();
    }

    public async Task<AdminBoxTypeDetailDto> GetBoxTypeByIdAsync(Guid id)
    {
        var b = await _db.BoxTypes.AsNoTracking().Include(x => x.BoxSlots.OrderBy(s => s.SortOrder))
            .FirstOrDefaultAsync(x => x.Id == id)
            ?? throw new NotFoundException("BOX_TYPE_NOT_FOUND", "نوع البوكس مش موجود");

        return new AdminBoxTypeDetailDto
        {
            Id = b.Id,
            Name = b.Name,
            Slug = b.Slug,
            Gender = b.Gender,
            BasePrice = b.BasePrice,
            ImageUrl = b.ImageUrl,
            IsActive = b.IsActive,
            Slots = b.BoxSlots.Select(s => new AdminBoxSlotDto
            {
                Id = s.Id,
                SlotKey = s.SlotKey,
                LabelAr = s.LabelAr,
                LabelEn = s.LabelEn,
                IsRequired = s.IsRequired,
                SortOrder = s.SortOrder,
                FilterGender = s.FilterGender,
            }).ToList(),
        };
    }

    public async Task<Guid> CreateBoxTypeAsync(CreateBoxTypeDto dto)
    {
        var slug = GenerateSlug(dto.Name);
        if (await _db.BoxTypes.AnyAsync(b => b.Slug == slug))
            slug += "-" + Guid.NewGuid().ToString()[..4];

        var boxType = new BoxType
        {
            Id = Guid.NewGuid(),
            Name = dto.Name,
            NameEn = dto.NameEn,
            Slug = slug,
            Gender = dto.Gender,
            BasePrice = dto.BasePrice,
            ImageUrl = dto.ImageUrl,
            IsActive = dto.IsActive,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };
        _db.BoxTypes.Add(boxType);
        await _db.SaveChangesAsync();

        _logger.LogInformation("Box type created: {BoxTypeName}", boxType.Name);

        return boxType.Id;
    }

    public async Task UpdateBoxTypeAsync(Guid id, CreateBoxTypeDto dto)
    {
        var boxType = await _db.BoxTypes.FindAsync(id)
            ?? throw new NotFoundException("BOX_TYPE_NOT_FOUND", "نوع البوكس مش موجود");

        if (boxType.Name != dto.Name)
        {
            var slug = GenerateSlug(dto.Name);
            if (await _db.BoxTypes.AnyAsync(b => b.Slug == slug && b.Id != id))
                slug += "-" + Guid.NewGuid().ToString()[..4];
            boxType.Slug = slug;
        }

        boxType.Name = dto.Name;
        boxType.NameEn = dto.NameEn;
        boxType.Gender = dto.Gender;
        boxType.BasePrice = dto.BasePrice;
        boxType.ImageUrl = dto.ImageUrl;
        boxType.IsActive = dto.IsActive;
        boxType.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        _logger.LogInformation("Box type {BoxTypeId} updated", id);
    }

    public async Task DeleteBoxTypeAsync(Guid id)
    {
        var boxType = await _db.BoxTypes.FindAsync(id)
            ?? throw new NotFoundException("BOX_TYPE_NOT_FOUND", "نوع البوكس مش موجود");

        boxType.IsActive = false;
        boxType.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        _logger.LogInformation("Box type {BoxTypeId} soft-deleted", id);
    }

    public async Task<Guid> CreateSlotAsync(Guid boxTypeId, CreateSlotDto dto)
    {
        if (!await _db.BoxTypes.AnyAsync(b => b.Id == boxTypeId))
            throw new NotFoundException("BOX_TYPE_NOT_FOUND", "نوع البوكس مش موجود");

        var slot = new BoxSlot
        {
            Id = Guid.NewGuid(),
            BoxTypeId = boxTypeId,
            SlotKey = dto.SlotKey,
            LabelAr = dto.LabelAr,
            LabelEn = dto.LabelEn,
            IsRequired = dto.IsRequired,
            SortOrder = dto.SortOrder,
            FilterGender = dto.FilterGender,
        };
        _db.BoxSlots.Add(slot);
        await _db.SaveChangesAsync();

        _logger.LogInformation("Slot created for box type {BoxTypeId}", boxTypeId);

        return slot.Id;
    }

    public async Task UpdateSlotAsync(Guid boxTypeId, Guid slotId, CreateSlotDto dto)
    {
        var slot = await _db.BoxSlots.FirstOrDefaultAsync(s => s.Id == slotId && s.BoxTypeId == boxTypeId)
            ?? throw new NotFoundException("SLOT_NOT_FOUND", "الـ Slot مش موجود");

        slot.SlotKey = dto.SlotKey;
        slot.LabelAr = dto.LabelAr;
        slot.LabelEn = dto.LabelEn;
        slot.IsRequired = dto.IsRequired;
        slot.SortOrder = dto.SortOrder;
        slot.FilterGender = dto.FilterGender;
        await _db.SaveChangesAsync();
    }

    public async Task DeleteSlotAsync(Guid boxTypeId, Guid slotId)
    {
        var slot = await _db.BoxSlots.FirstOrDefaultAsync(s => s.Id == slotId && s.BoxTypeId == boxTypeId)
            ?? throw new NotFoundException("SLOT_NOT_FOUND", "الـ Slot مش موجود");

        _db.BoxSlots.Remove(slot);
        await _db.SaveChangesAsync();
    }

    public async Task<List<CategoryCustomizationPriceDto>> GetCustomizationPricesAsync()
    {
        return await _db.CategoryCustomizationPrices
            .AsNoTracking()
            .OrderBy(c => c.Category)
            .Select(c => new CategoryCustomizationPriceDto
            {
                Id = c.Id,
                Category = c.Category,
                Price = c.Price
            })
            .ToListAsync();
    }

    public async Task UpsertCustomizationPriceAsync(UpsertCustomizationPriceDto dto)
    {
        var existing = await _db.CategoryCustomizationPrices
            .FirstOrDefaultAsync(c => c.Category == dto.Category);

        if (existing != null)
        {
            existing.Price = dto.Price;
        }
        else
        {
            _db.CategoryCustomizationPrices.Add(new Models.CategoryCustomizationPrice
            {
                Category = dto.Category,
                Price = dto.Price
            });
        }

        await _db.SaveChangesAsync();
    }

    public async Task DeleteCustomizationPriceAsync(Guid id)
    {
        var price = await _db.CategoryCustomizationPrices.FindAsync(id)
            ?? throw new NotFoundException("PRICE_NOT_FOUND", "سعر التخصيص مش موجود");

        _db.CategoryCustomizationPrices.Remove(price);
        await _db.SaveChangesAsync();
    }

    private static string GenerateSlug(string name)
    {
        var slug = name.ToLowerInvariant().Trim();
        slug = SlugWhitespaceRegex().Replace(slug, "-");
        slug = SlugSpecialCharsRegex().Replace(slug, "");
        slug = SlugMultiDashRegex().Replace(slug, "-");
        return slug.Trim('-');
    }

    [GeneratedRegex(@"\s+")]
    private static partial Regex SlugWhitespaceRegex();

    [GeneratedRegex(@"[^a-z0-9\u0621-\u064A\-]")]
    private static partial Regex SlugSpecialCharsRegex();

    [GeneratedRegex(@"-{2,}")]
    private static partial Regex SlugMultiDashRegex();
}
