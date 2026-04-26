using SoulmateStore.Models.Enums;

namespace SoulmateStore.Models;

public class Payment
{
    public Guid Id { get; set; }
    public Guid OrderId { get; set; }
    public PaymentMethod Method { get; set; }
    public string ScreenshotUrl { get; set; } = "";
    public PaymentStatus Status { get; set; } = PaymentStatus.Pending;
    public string? AdminNote { get; set; }
    public int AttemptNumber { get; set; } = 1;
    public DateTime CreatedAt { get; set; }

    public Order Order { get; set; } = null!;
}
