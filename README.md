# Soulmate Accessories Store

A full-stack e-commerce platform specializing in customizable accessory gift boxes. The backend and frontend are decoupled and deploy independently.

## Features

- **Custom Box Builder**: Interactive interface to select box types and fill them with products from specific categories.
- **Product Management**: Standalone and builder-specific items with category-based customization prices.
- **Order System**: Complete lifecycle from pending payment to delivery, with stock control and order expiration.
- **Notifications**: Email and in-app notifications for order status updates and payment verification.
- **Security**: JWT-based authentication, CSRF protection, rate limiting, and security headers.
- **Admin Dashboard**: Manage products, orders, inventory, promotions, coupons, and system settings.
- **Bilingual**: Arabic/English UI with RTL support and multilingual SEO.

## Tech Stack

- **Backend**: ASP.NET Core 8 Web API, Entity Framework Core, SQL Server, Serilog.
- **Frontend**: Angular 21 (standalone components) with SSR, Tailwind CSS.
- **Storage**: Cloudinary for product and payment receipt images.

## Project Structure

```text
/backend            - ASP.NET Core Web API (self-contained, deploys to MonsterASP.NET/IIS)
  /Tests            - xUnit test project
  /Migrations       - EF Core migrations (applied automatically on startup)
/frontend           - Angular SSR app (self-contained, deploys to Vercel)
/.github/workflows  - CI (backend build + tests, frontend lint + build)
```

## Local Development

### Backend

1. Navigate to `/backend`.
2. Create `appsettings.Development.json` (gitignored) using `appsettings.Example.json` as the reference for the full configuration shape. `appsettings.json` contains only safe, non-secret defaults.
3. `dotnet restore`
4. `dotnet run` — migrations are applied automatically on startup (local SQL Server/LocalDB required). The API listens on `http://localhost:5291`.

### Frontend

1. Navigate to `/frontend`.
2. `npm ci`
3. `npm start` — serves on `http://localhost:4200`; `environment.development.ts` points to the backend at `http://localhost:5291`.

## Build / Lint / Test

```bash
# Backend (from /backend)
dotnet build --configuration Release
dotnet test Tests/SoulmateStore.Tests.csproj --configuration Release

# Frontend (from /frontend)
npm run lint
npm run build
npm test                 # unit tests (Vitest)
```

## Production Environment Variables

### Backend (set on the host, e.g. MonsterASP.NET control panel)

Production configuration is supplied **exclusively via environment variables** — `appsettings.Production.json` is gitignored and must never be committed. ASP.NET Core maps `Section__Key` variables to `"Section": { "Key": ... }` values.

Required:

| Variable | Purpose |
|---|---|
| `ConnectionStrings__DefaultConnection` | SQL Server connection string (includes DB credentials) |
| `Jwt__Secret` | Token signing key (min 32 chars) |
| `Jwt__Issuer` / `Jwt__Audience` | Token issuer/audience |
| `Cloudinary__CloudName` / `Cloudinary__ApiKey` / `Cloudinary__ApiSecret` | Image storage credentials |
| `Mail__User` / `Mail__Password` | SMTP credentials (use a Gmail App Password) |
| `InternalApi__Key` | Key for internal service-to-service calls |

Also required for a working deployment (non-secret):

| Variable | Purpose |
|---|---|
| `Cors__AllowedOrigins__0` | Frontend origin, e.g. `https://your-app.vercel.app` |
| `FrontendUrl` | Public frontend URL (used in emails and SEO endpoints) |
| `Payment__VodafoneCashNumber` / `Payment__InstaPayNumber` | Payment account numbers shown at checkout |

### Frontend (set in the Vercel project settings)

| Variable | Purpose |
|---|---|
| `API_BASE_URL` | Public backend base URL, e.g. `https://your-api.runasp.net`. Injected at build time by `scripts/set-env.mjs` (runs as part of `npm run build`). |

No backend secrets may ever be placed in frontend variables — everything in the frontend bundle is public.

## Deployment

### Backend → MonsterASP.NET (or any IIS/ASP.NET host)

1. From `/backend`, run `dotnet publish -c Release -o publish`.
2. Upload the contents of `publish/` to the host (WebDeploy/FTP). `web.config` is included and sets `ASPNETCORE_ENVIRONMENT=Production`.
3. Set all backend environment variables listed above in the host control panel.
4. EF Core migrations run automatically on startup.
5. Verify: `https://<backend-domain>/api/health`.

### Frontend → Vercel

1. Import the repository in Vercel and set the **Root Directory** to `frontend/` (`vercel.json` provides build settings and security headers).
2. Set the `API_BASE_URL` environment variable to the deployed backend URL.
3. Deploy. SSR is served through the Vercel function entry at `api/server.mjs`.
4. Add the resulting Vercel domain to the backend's `Cors__AllowedOrigins__0` and `FrontendUrl` variables.

## Security Notes

- **Secrets**: All production secrets (DB password, JWT secret, Cloudinary secret, mail app password, internal API key) come only from host environment variables. `appsettings.Production.json`, `appsettings.Development.json`, `.env*`, and publish profiles are gitignored.
- **Rotate leaked credentials**: Credentials were committed to git history in the past. Any secret that ever appeared in version control must be treated as compromised and **rotated at the source** (database provider, Cloudinary, Gmail, JWT secret, internal API key). Removing files from the repo does not invalidate the values.
- **Seeded admin account**: `SeedData.cs` creates a default admin (`admin@soulmate.com`) with a known development password. Change this account's password immediately in any real deployment.
- **CSRF**: Cookie-based endpoints (logout, token refresh) are protected by CSRF tokens.
