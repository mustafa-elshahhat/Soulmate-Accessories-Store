using System.ComponentModel.DataAnnotations;
using SoulmateStore.Models.Enums;

namespace SoulmateStore.DTOs.Orders;

public record CreateOrderDto
{
    [Required]
    public Guid AddressId { get; init; }

    [Required]
    [MinLength(1, ErrorMessage = "السلة فاضية")]
    public List<CreateOrderItemDto> Items { get; init; } = [];

    [MaxLength(50)]
    public string? CouponCode { get; init; }
}

public record CreateOrderItemDto : IValidatableObject
{
    public Guid? ProductId { get; init; }
    public Guid? BoxTypeId { get; init; }

    [Range(1, 10, ErrorMessage = "الكمية لازم تكون بين 1 و 10")]
    public int Quantity { get; init; }

    public string CustomDataJson { get; init; } = "{}";

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        if (ProductId == null && BoxTypeId == null)
        {
            yield return new ValidationResult(
                "لازم تحدد منتج أو بوكس واحد على الأقل",
                [nameof(ProductId), nameof(BoxTypeId)]);
        }
    }
}

public record OrderResponseDto
{
    public Guid Id { get; init; }
    public string OrderNumber { get; init; } = "";
    public OrderStatus Status { get; init; }
    public decimal TotalPrice { get; init; }
    public decimal ShippingCost { get; init; }
    public string? CouponCode { get; init; }
    public decimal DiscountAmount { get; init; }
    public string? CancelReason { get; init; }
    public string? AdminNote { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime UpdatedAt { get; init; }
    public List<OrderItemResponseDto> Items { get; init; } = [];
    public OrderAddressDto? ShippingAddress { get; init; }
    public OrderPaymentDto? Payment { get; init; }
}

public record OrderAddressDto
{
    public string Label { get; init; } = "";
    public string GovernorateName { get; init; } = "";
    public string GovernorateNameEn { get; init; } = "";
    public string City { get; init; } = "";
    public string District { get; init; } = "";
    public string Street { get; init; } = "";
    public string Building { get; init; } = "";
    public string Floor { get; init; } = "";
    public string? Apartment { get; init; }
    public string Phone { get; init; } = "";
    public double Lat { get; init; }
    public double Lng { get; init; }
}

public record OrderPaymentDto
{
    public PaymentStatus Status { get; init; }
    public PaymentMethod Method { get; init; }
    public string? ScreenshotUrl { get; init; }
}

public record OrderItemResponseDto
{
    public Guid Id { get; init; }
    public Guid? ProductId { get; init; }
    public Guid? BoxTypeId { get; init; }
    public int Quantity { get; init; }
    public decimal UnitPrice { get; init; }
    public string CustomDataJson { get; init; } = "";
    public string? ProductName { get; init; }
    public string? ProductNameEn { get; init; }
}

public record OrderPreviewDto
{
    public List<OrderPreviewItemDto> Items { get; init; } = [];
    public decimal TotalPrice { get; init; }
    public decimal ShippingCost { get; init; }
    public decimal GrandTotal { get; init; }
}

public record OrderPreviewItemDto
{
    public Guid? ProductId { get; init; }
    public Guid? BoxTypeId { get; init; }
    public int Quantity { get; init; }
    public decimal UnitPrice { get; init; }
    public string? ProductName { get; init; }
}
