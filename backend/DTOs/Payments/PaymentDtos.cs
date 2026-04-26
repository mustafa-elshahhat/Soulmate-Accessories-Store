using SoulmateStore.Models.Enums;

namespace SoulmateStore.DTOs.Payments;

public record PaymentResponseDto
{
    public Guid Id { get; init; }
    public Guid OrderId { get; init; }
    public PaymentMethod Method { get; init; }
    public string ScreenshotUrl { get; init; } = "";
    public PaymentStatus Status { get; init; }
    public string? AdminNote { get; init; }
    public int AttemptNumber { get; init; }
    public DateTime CreatedAt { get; init; }
}

public record PaymentInfoDto
{
    public string VodafoneCashNumber { get; init; } = "";
    public string InstaPayNumber { get; init; } = "";
}
