using System.ComponentModel.DataAnnotations;

namespace SoulmateStore.DTOs.Addresses;

public record CreateAddressDto
{
    [Required(ErrorMessage = "الاسم مطلوب")]
    public string Label { get; init; } = "";

    [Required(ErrorMessage = "المحافظة مطلوبة")]
    public Guid GovernorateId { get; init; }

    public string City { get; init; } = "";
    public string District { get; init; } = "";

    [Required(ErrorMessage = "الشارع مطلوب")]
    public string Street { get; init; } = "";

    [Required(ErrorMessage = "المبنى مطلوب")]
    public string Building { get; init; } = "";

    [Required(ErrorMessage = "الدور مطلوب")]
    public string Floor { get; init; } = "";

    public string? Apartment { get; init; }

    [Required(ErrorMessage = "رقم الهاتف مطلوب")]
    [RegularExpression(@"^01[0125]\d{8}$", ErrorMessage = "رقم الهاتف لازم يكون 11 رقم ويبدأ بـ 010 أو 011 أو 012 أو 015")]
    public string Phone { get; init; } = "";

    public double Lat { get; init; }
    public double Lng { get; init; }
    public bool IsDefault { get; init; }
}

public record AddressResponseDto
{
    public Guid Id { get; init; }
    public string Label { get; init; } = "";
    public Guid GovernorateId { get; init; }
    public string GovernorateName { get; init; } = "";
    public string GovernorateNameEn { get; init; } = "";
    public decimal ShippingCost { get; init; }
    public string City { get; init; } = "";
    public string District { get; init; } = "";
    public string Street { get; init; } = "";
    public string Building { get; init; } = "";
    public string Floor { get; init; } = "";
    public string? Apartment { get; init; }
    public string Phone { get; init; } = "";
    public double Lat { get; init; }
    public double Lng { get; init; }
    public bool IsDefault { get; init; }
}
