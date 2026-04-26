using System.ComponentModel.DataAnnotations;

namespace SoulmateStore.DTOs.BoxReviews;

public record CreateBoxReviewDto
{
    [Required]
    public Guid BoxTypeId { get; init; }

    [Required]
    public Guid OrderId { get; init; }

    [Required]
    [Range(1, 5)]
    public int Rating { get; init; }

    [MaxLength(1000)]
    public string? Comment { get; init; }
}

public record BoxReviewResponseDto
{
    public Guid Id { get; init; }
    public Guid UserId { get; init; }
    public string UserName { get; init; } = "";
    public Guid BoxTypeId { get; init; }
    public Guid OrderId { get; init; }
    public int Rating { get; init; }
    public string? Comment { get; init; }
    public DateTime CreatedAt { get; init; }
}

public record BoxReviewsSummaryDto
{
    public double AverageRating { get; init; }
    public int TotalReviews { get; init; }
    public List<BoxReviewResponseDto> Reviews { get; init; } = [];
}
