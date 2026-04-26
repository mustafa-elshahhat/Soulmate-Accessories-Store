using System.ComponentModel.DataAnnotations;
using SoulmateStore.Models.Enums;

namespace SoulmateStore.DTOs.Builder;

public record BoxTypeDto
{
    public Guid Id { get; init; }
    public string Name { get; init; } = "";
    public string NameEn { get; init; } = "";
    public string Slug { get; init; } = "";
    public Gender Gender { get; init; }
    public decimal BasePrice { get; init; }
    public string ImageUrl { get; init; } = "";
}

public record BoxSlotDto
{
    public Guid Id { get; init; }
    public string SlotKey { get; init; } = "";
    public string LabelAr { get; init; } = "";
    public string LabelEn { get; init; } = "";
    public bool IsRequired { get; init; }
    public int SortOrder { get; init; }
    public Gender? FilterGender { get; init; }
}

public record PreviewRequestDto
{
    [Required(ErrorMessage = "نوع البوكس مطلوب")]
    public Guid BoxTypeId { get; init; }

    [Required(ErrorMessage = "السلوتات مطلوبة")]
    [MinLength(1, ErrorMessage = "لازم تختار منتج واحد على الأقل")]
    public Dictionary<string, Guid> Slots { get; init; } = new();
    public CustomizationDto? Customization { get; init; }
    public List<string> CustomizedSlots { get; init; } = [];
}

public record CustomizationDto
{
    public string? Name1 { get; init; }
    public string? Name2 { get; init; }
    public string? Date { get; init; }
    public string? Message { get; init; }
}

public record PreviewResponseDto
{
    public PreviewBoxTypeDto BoxType { get; init; } = null!;
    public List<PreviewSelectedProductDto> SelectedProducts { get; init; } = [];
    public CustomizationDto? Customization { get; init; }
    public List<CustomizedProductDto> CustomizedProducts { get; init; } = [];
    public decimal CustomizationTotal { get; init; }
    public decimal TotalPrice { get; init; }
}

public record PreviewBoxTypeDto
{
    public Guid Id { get; init; }
    public string Name { get; init; } = "";
    public string NameEn { get; init; } = "";
    public decimal BasePrice { get; init; }
}

public record PreviewSelectedProductDto
{
    public Guid SlotId { get; init; }
    public string SlotKey { get; init; } = "";
    public string LabelAr { get; init; } = "";
    public string LabelEn { get; init; } = "";
    public string Name { get; init; } = "";
    public string NameEn { get; init; } = "";
    public decimal Price { get; init; }
}

public record CustomizedProductDto
{
    public Guid SlotId { get; init; }
    public string Name { get; init; } = "";
    public string NameEn { get; init; } = "";
    public string Category { get; init; } = "";
    public decimal CustomizationPrice { get; init; }
}

public record SlotProductDto
{
    public Guid Id { get; init; }
    public string Name { get; init; } = "";
    public string NameEn { get; init; } = "";
    public decimal Price { get; init; }
    public string ImageUrl { get; init; } = "";
    public string Category { get; init; } = "";
    public Gender Gender { get; init; }
    public bool IsCustomizable { get; init; }
    public decimal CustomizationPrice { get; init; }
}
