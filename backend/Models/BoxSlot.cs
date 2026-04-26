using SoulmateStore.Models.Enums;

namespace SoulmateStore.Models;

public class BoxSlot
{
    public Guid Id { get; set; }
    public Guid BoxTypeId { get; set; }
    public string SlotKey { get; set; } = "";
    public string LabelAr { get; set; } = "";
    public string LabelEn { get; set; } = "";
    public bool IsRequired { get; set; }
    public int SortOrder { get; set; }
    public Gender? FilterGender { get; set; }

    public BoxType BoxType { get; set; } = null!;
}
