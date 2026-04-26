using SoulmateStore.Models.Enums;

namespace SoulmateStore.Models;

public class BoxType
{
    public Guid Id { get; set; }
    public string Name { get; set; } = "";
    public string NameEn { get; set; } = "";
    public string Slug { get; set; } = "";
    public Gender Gender { get; set; }
    public decimal BasePrice { get; set; }
    public string ImageUrl { get; set; } = "";
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public ICollection<BoxSlot> BoxSlots { get; set; } = [];
}
