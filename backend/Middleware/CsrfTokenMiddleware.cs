using Microsoft.AspNetCore.Antiforgery;

namespace SoulmateStore.Middleware;

/// <summary>
/// Issues an XSRF-TOKEN cookie (non-httpOnly) that Angular can read and send back
/// as the X-XSRF-TOKEN header for CSRF protection on cookie-based endpoints.
/// </summary>
public class CsrfTokenMiddleware
{
    private readonly RequestDelegate _next;
    private readonly IAntiforgery _antiforgery;

    public CsrfTokenMiddleware(RequestDelegate next, IAntiforgery antiforgery)
    {
        _next = next;
        _antiforgery = antiforgery;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        // Issue the CSRF token cookie on every GET request so Angular can pick it up.
        // This ensures the token is available before any state-changing request.
        if (HttpMethods.IsGet(context.Request.Method))
        {
            var tokens = _antiforgery.GetAndStoreTokens(context);
            context.Response.Cookies.Append("XSRF-TOKEN", tokens.RequestToken!, new CookieOptions
            {
                HttpOnly = false,   // Angular must be able to read this
                Secure = context.Request.IsHttps,
                SameSite = context.Request.IsHttps ? SameSiteMode.None : SameSiteMode.Lax,
                Path = "/"
            });
        }

        await _next(context);
    }
}
