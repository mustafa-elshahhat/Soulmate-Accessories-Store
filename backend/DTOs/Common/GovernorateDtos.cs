using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace SoulmateStore.DTOs.Common;

public record GovernorateDto
{
    public Guid Id { get; init; }
    public string Name { get; init; } = "";

    [JsonPropertyName("name_en")]
    public string NameEn { get; init; } = "";

    [JsonPropertyName("shipping_cost")]
    public decimal ShippingCost { get; init; }

    [JsonPropertyName("is_active")]
    public bool IsActive { get; init; }
}

public record UpdateGovernorateDto
{
    [JsonPropertyName("shipping_cost")]
    [Range(0, (double)decimal.MaxValue, ErrorMessage = "تكلفة الشحن لازم تكون 0 أو أكتر")]
    public decimal ShippingCost { get; init; }

    [JsonPropertyName("is_active")]
    public bool IsActive { get; init; }
}
