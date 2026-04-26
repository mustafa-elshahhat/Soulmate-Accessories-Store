using System.ComponentModel.DataAnnotations;

namespace SoulmateStore.DTOs.Reviews;

public record CreateReviewDto
{
    [Required]
    public Guid ProductId { get; init; }

    [Required]
    [Range(1, 5)]
    public int Rating { get; init; }

    [MaxLength(1000)]
    public string? Comment { get; init; }
}

public record UpdateReviewDto
{
    [Required]
    [Range(1, 5)]
    public int Rating { get; init; }

    [MaxLength(1000)]
    public string? Comment { get; init; }
}

public record ReviewResponseDto
{
    public Guid Id { get; init; }
    public Guid UserId { get; init; }
    public string UserName { get; init; } = "";
    public Guid ProductId { get; init; }
    public int Rating { get; init; }
    public string? Comment { get; init; }
    public DateTime CreatedAt { get; init; }
}

public record ProductReviewsSummaryDto
{
    public double AverageRating { get; init; }
    public int TotalReviews { get; init; }
    public List<ReviewResponseDto> Reviews { get; init; } = [];
}
