using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using SoulmateStore.Models.Enums;

namespace SoulmateStore.DTOs.Admin;

public record UpdateOrderStatusDto
{
    [Required(ErrorMessage = "حالة الطلب مطلوبة")]
    public OrderStatus Status { get; init; }
    public string? CancelReason { get; init; }
    public string? AdminNote { get; init; }
}

public record PaymentActionDto
{
    [Required(ErrorMessage = "الإجراء مطلوب")]
    [RegularExpression("^(verify|reject)$", ErrorMessage = "الإجراء لازم يكون verify أو reject")]
    public string Action { get; init; } = "";
    public string? AdminNote { get; init; }
}

public record CreateBoxTypeDto
{
    [Required(ErrorMessage = "اسم البوكس مطلوب")]
    [MaxLength(100)]
    public string Name { get; init; } = "";

    [MaxLength(100)]
    public string NameEn { get; init; } = "";

    [Required(ErrorMessage = "النوع مطلوب")]
    public Gender Gender { get; init; }

    [Range(0, 100000, ErrorMessage = "السعر لازم يكون بين 0 و 100000")]
    public decimal BasePrice { get; init; }

    [Required(ErrorMessage = "رابط الصورة مطلوب")]
    public string ImageUrl { get; init; } = "";

    public bool IsActive { get; init; } = true;
}

public record CreateSlotDto
{
    [Required(ErrorMessage = "مفتاح السلوت مطلوب")]
    [MaxLength(50)]
    public string SlotKey { get; init; } = "";

    [Required(ErrorMessage = "اسم السلوت بالعربي مطلوب")]
    [MaxLength(100)]
    public string LabelAr { get; init; } = "";

    [MaxLength(100)]
    public string LabelEn { get; init; } = "";

    public bool IsRequired { get; init; }

    [Range(0, 100)]
    public int SortOrder { get; init; }

    public Gender? FilterGender { get; init; }
}

// ── Response DTOs ──

public record DashboardDto
{
    public int TotalOrders { get; init; }
    public int PendingOrders { get; init; }
    public int PaymentReview { get; init; }
    public decimal TotalRevenue { get; init; }
    public int TotalProducts { get; init; }
    public int TotalUsers { get; init; }
}

public record AdminOrderListDto
{
    public Guid Id { get; init; }
    public string OrderNumber { get; init; } = "";
    public OrderStatus Status { get; init; }
    public decimal TotalPrice { get; init; }
    public decimal ShippingCost { get; init; }
    public string CustomerName { get; init; } = "";
    public string CustomerEmail { get; init; } = "";
    public int ItemsCount { get; init; }
    public DateTime CreatedAt { get; init; }
}

public record AdminOrderDetailDto
{
    public Guid Id { get; init; }
    public string OrderNumber { get; init; } = "";
    public OrderStatus Status { get; init; }
    public decimal TotalPrice { get; init; }
    public decimal ShippingCost { get; init; }
    public string? CancelReason { get; init; }
    public string? AdminNote { get; init; }
    public DateTime CreatedAt { get; init; }
    public AdminCustomerDto Customer { get; init; } = null!;
    public AdminAddressDto? Address { get; init; }
    public List<AdminOrderItemDto> Items { get; init; } = [];
    public List<AdminPaymentDetailDto> Payments { get; init; } = [];
}

public record AdminCustomerDto
{
    public string Name { get; init; } = "";
    public string Email { get; init; } = "";
    public string Phone { get; init; } = "";
}

public record AdminAddressDto
{
    public string Label { get; init; } = "";
    public string GovernorateName { get; init; } = "";
    public string GovernorateNameEn { get; init; } = "";
    public string City { get; init; } = "";
    public string District { get; init; } = "";
    public string Street { get; init; } = "";
    public string Building { get; init; } = "";
    public string Floor { get; init; } = "";
    public string Phone { get; init; } = "";
    public double Lat { get; init; }
    public double Lng { get; init; }
}

public record AdminOrderItemDto
{
    public Guid Id { get; init; }
    public Guid? ProductId { get; init; }
    public Guid? BoxTypeId { get; init; }
    public string? ProductName { get; init; }
    public string? ProductNameEn { get; init; }
    public string? ProductImageUrl { get; init; }
    public string? BoxTypeName { get; init; }
    public string? BoxTypeNameEn { get; init; }
    public int Quantity { get; init; }
    public decimal UnitPrice { get; init; }
    public string? CustomDataJson { get; init; }
    public List<AdminBoxSlotProductDto>? SlotProducts { get; init; }
}

public record AdminBoxSlotProductDto
{
    public string SlotLabel { get; init; } = "";
    public string SlotLabelEn { get; init; } = "";
    public string ProductName { get; init; } = "";
    public string ProductNameEn { get; init; } = "";
    public string ProductImageUrl { get; init; } = "";
    public decimal ProductPrice { get; init; }
    public bool IsCustomized { get; init; }
    public decimal CustomizationPrice { get; init; }
}

public record AdminPaymentDetailDto
{
    public Guid Id { get; init; }
    public PaymentMethod Method { get; init; }
    public string ScreenshotUrl { get; init; } = "";
    public PaymentStatus Status { get; init; }
    public string? AdminNote { get; init; }
    public int AttemptNumber { get; init; }
    public DateTime CreatedAt { get; init; }
}

public record AdminUserDto
{
    public Guid Id { get; init; }
    public string Name { get; init; } = "";
    public string Email { get; init; } = "";
    public string Phone { get; init; } = "";
    public bool IsLocked { get; init; }
    public DateTime CreatedAt { get; init; }
}

public record AnalyticsDto
{
    [JsonPropertyName("last_30_days")]
    public Last30DaysDto Last30Days { get; init; } = null!;
    public int TodayOrders { get; init; }
    public int PendingPayments { get; init; }
    public List<StatusBreakdownDto> StatusBreakdown { get; init; } = [];
    public List<TopProductDto> TopProducts { get; init; } = [];
}

public record Last30DaysDto
{
    public decimal Revenue { get; init; }
    public int OrderCount { get; init; }
    public decimal AvgOrderValue { get; init; }
}

public record StatusBreakdownDto
{
    public OrderStatus Status { get; init; }
    public int Count { get; init; }
}

public record TopProductDto
{
    public string Name { get; init; } = "";
    public string NameEn { get; init; } = "";
    public int SalesCount { get; init; }
}

public record AdminBoxTypeListDto
{
    public Guid Id { get; init; }
    public string Name { get; init; } = "";
    public string Slug { get; init; } = "";
    public Gender Gender { get; init; }
    public decimal BasePrice { get; init; }
    public string ImageUrl { get; init; } = "";
    public bool IsActive { get; init; }
    public int SlotsCount { get; init; }
    public DateTime CreatedAt { get; init; }
}

public record AdminBoxTypeDetailDto
{
    public Guid Id { get; init; }
    public string Name { get; init; } = "";
    public string Slug { get; init; } = "";
    public Gender Gender { get; init; }
    public decimal BasePrice { get; init; }
    public string ImageUrl { get; init; } = "";
    public bool IsActive { get; init; }
    public List<AdminBoxSlotDto> Slots { get; init; } = [];
}

public record AdminBoxSlotDto
{
    public Guid Id { get; init; }
    public string SlotKey { get; init; } = "";
    public string LabelAr { get; init; } = "";
    public string LabelEn { get; init; } = "";
    public bool IsRequired { get; init; }
    public int SortOrder { get; init; }
    public Gender? FilterGender { get; init; }
}

public record CategoryCustomizationPriceDto
{
    public Guid Id { get; init; }
    public string Category { get; init; } = "";
    public decimal Price { get; init; }
}

public record UpsertCustomizationPriceDto
{
    [Required(ErrorMessage = "الفئة مطلوبة")]
    [MaxLength(50)]
    public string Category { get; init; } = "";

    [Range(0, 100000, ErrorMessage = "السعر لازم يكون 0 أو أكتر")]
    public decimal Price { get; init; }
}
