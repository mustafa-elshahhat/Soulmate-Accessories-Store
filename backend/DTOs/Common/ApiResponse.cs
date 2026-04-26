using SoulmateStore.Exceptions;

namespace SoulmateStore.DTOs.Common;

public record ApiResponse<T>
{
    public bool Success { get; init; } = true;
    public T? Data { get; init; }
    public string? Message { get; init; }
}

public record ApiErrorResponse
{
    public bool Success { get; init; } = false;
    public string Message { get; init; } = "";
    public string ErrorCode { get; init; } = "";
    public int StatusCode { get; init; }
    public List<FieldError>? Errors { get; init; }
}

public record PaginatedResponse<T>
{
    public bool Success { get; init; } = true;
    public List<T> Data { get; init; } = [];
    public PaginationMeta Meta { get; init; } = new();

    public static PaginatedResponse<T> Create(List<T> data, int page, int limit, int total) => new()
    {
        Data = data,
        Meta = new PaginationMeta
        {
            Page = page,
            Limit = limit,
            Total = total,
            TotalPages = (int)Math.Ceiling(total / (double)limit)
        }
    };
}

public record PaginationMeta
{
    public int Page { get; init; }
    public int Limit { get; init; }
    public int Total { get; init; }
    public int TotalPages { get; init; }
}
