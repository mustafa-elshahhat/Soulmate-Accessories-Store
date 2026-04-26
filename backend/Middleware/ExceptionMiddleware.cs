using System.Text.Json;
using SoulmateStore.DTOs.Common;
using SoulmateStore.Exceptions;

namespace SoulmateStore.Middleware;

public class ExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionMiddleware> _logger;

    public ExceptionMiddleware(RequestDelegate next, ILogger<ExceptionMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unhandled exception");
            await HandleExceptionAsync(context, ex);
        }
    }

    private static async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";

        var (statusCode, errorCode, message) = exception switch
        {
            NotFoundException e => (404, e.ErrorCode, e.Message),
            Exceptions.ValidationException e => (400, "VALIDATION_ERROR", e.Message),
            UnauthorizedException e => (401, e.ErrorCode, e.Message),
            ForbiddenException e => (403, e.ErrorCode, e.Message),
            ConflictException e => (409, e.ErrorCode, e.Message),
            AppException e => (400, e.ErrorCode, e.Message),
            _ => (500, "INTERNAL_ERROR", "حصل خطأ داخلي")
        };

        context.Response.StatusCode = statusCode;

        var errors = exception is Exceptions.ValidationException validationEx
            ? validationEx.Errors
            : null;

        var response = new ApiErrorResponse
        {
            Success = false,
            Message = message,
            ErrorCode = errorCode,
            StatusCode = statusCode,
            Errors = errors
        };

        var options = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower
        };

        await context.Response.WriteAsJsonAsync(response, options);
    }
}
