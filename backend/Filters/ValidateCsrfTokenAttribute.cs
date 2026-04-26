using Microsoft.AspNetCore.Antiforgery;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using SoulmateStore.DTOs.Common;

namespace SoulmateStore.Filters;

/// <summary>
/// Validates the CSRF antiforgery token (X-XSRF-TOKEN header) on endpoints
/// that rely on cookie-based authentication (refresh token, logout).
/// </summary>
[AttributeUsage(AttributeTargets.Method | AttributeTargets.Class)]
public class ValidateCsrfTokenAttribute : Attribute, IAsyncAuthorizationFilter
{
    public async Task OnAuthorizationAsync(AuthorizationFilterContext context)
    {
        var antiforgery = context.HttpContext.RequestServices.GetRequiredService<IAntiforgery>();

        try
        {
            await antiforgery.ValidateRequestAsync(context.HttpContext);
        }
        catch (AntiforgeryValidationException)
        {
            context.Result = new JsonResult(new ApiErrorResponse
            {
                ErrorCode = "CSRF_VALIDATION_FAILED",
                Message = "CSRF token validation failed",
                StatusCode = 400
            })
            {
                StatusCode = 400
            };
        }
    }
}
