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
    private readonly IWebHostEnvironment _env;

    public CsrfTokenMiddleware(RequestDelegate next, IAntiforgery antiforgery, IWebHostEnvironment env)
    {
        _next = next;
        _antiforgery = antiforgery;
        _env = env;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        // Issue the CSRF token cookie on every GET request so Angular can pick it up.
        // This ensures the token is available before any state-changing request.
        if (HttpMethods.IsGet(context.Request.Method))
        {
            var tokens = _antiforgery.GetAndStoreTokens(context);
            var isProduction = !_env.IsDevelopment();
            context.Response.Cookies.Append("XSRF-TOKEN", tokens.RequestToken!, new CookieOptions
            {
                HttpOnly = false,   // Angular must be able to read this
                Secure = isProduction || context.Request.IsHttps,
                SameSite = isProduction ? SameSiteMode.None : SameSiteMode.Lax,
                Path = "/"
            });
        }

        await _next(context);
    }
}
