# Soulmate Accessories Store

A full-stack e-commerce platform specializing in customizable accessory boxes. The project features a modern architecture with a decoupled backend and frontend.

## Project Overview

Soulmate Accessories Store provides a seamless shopping experience where customers can purchase individual products or build their own customized accessory boxes. The system handles order management, stock control, and automated customer communication via email and in-app notifications.

## Features

- **Custom Box Builder**: Interactive interface to select box types and fill them with products from specific categories.
- **Product Management**: Standalone and builder-specific items with category-based customization prices.
- **Order System**: Complete lifecycle from pending payment to delivery.
- **Notifications**: Email and in-app notifications for order status updates and payment verification.
- **Security**: JWT-based authentication, CSRF protection, and internal service hardening.
- **Admin Dashboard**: Manage products, orders, inventory, and system settings.

## Tech Stack

- **Backend**: ASP.NET Core 10.0 Web API, Entity Framework Core, SQL Server.
- **Frontend**: Angular 21 (Standalone components), SSR (Server-Side Rendering), Tailwind CSS.
- **Storage**: Cloudinary for product and payment receipt images.

## Architecture

The project follows a clean architecture pattern:
- **Client Side**: Angular handles the UI and state management.
- **API Layer**: ASP.NET Core provides RESTful endpoints and handles business logic.
- **Data Layer**: SQL Server managed via EF Core Migrations.
- **Notification Layer**: Email (SMTP) and in-app database notifications dispatched via a background queue.

## Project Structure

```text
/backend            - ASP.NET Core Web API
/frontend           - Angular SPA
```

## Environment Variables

### Backend
Production configuration is supplied **exclusively via environment variables** -
`backend/appsettings.Production.json` is gitignored and must never be committed.
Use `backend/appsettings.Example.json` as a reference for the full configuration
shape (including non-secret settings). ASP.NET Core maps `Section__Key`
environment variables to `"Section": { "Key": ... }` configuration values, so set:

- `ConnectionStrings__DefaultConnection`: SQL Server connection string (includes DB credentials).
- `Jwt__Secret`: Secret key for token signing (min 32 chars).
- `Jwt__Issuer` / `Jwt__Audience`: Token issuer/audience values.
- `Cloudinary__CloudName`, `Cloudinary__ApiKey`, `Cloudinary__ApiSecret`: Credentials for image storage.
- `Mail__User`, `Mail__Password`: SMTP credentials for outbound email (use a Gmail App Password).
- `InternalApi__Key`: Key used for internal/administrative service-to-service calls.

## Setup Instructions

### Backend Setup
1. Navigate to `/backend`.
2. Copy `appsettings.Example.json` for the configuration shape, then either fill in
   `appsettings.Development.json` (gitignored) for local development or set the
   environment variables listed above for production. Never commit real credentials.
3. Run `dotnet restore`.
4. Run `dotnet ef database update` to apply migrations via local SQL Server/LocalDB.
5. Run `dotnet run` or `dotnet build --configuration Release` to start or build the API.

### Frontend Setup
1. Navigate to `/frontend`.
2. Run `npm ci`.
3. Verify `environment.development.ts` points to your backend.
4. Run `npm run start` for development or `npm run build` for production.

## Testing

Run backend tests using:
```bash
cd backend
dotnet test Tests/SoulmateStore.Tests.csproj --configuration Release
```

Run frontend linting and building:
```bash
cd frontend
npm run lint
npm run build
```

## Security Notes

- **Secrets**: Production secrets (database password, JWT secret, Cloudinary API secret,
  Gmail app password, internal API key, etc.) must be supplied **only** via environment
  variables or a secret manager - never via committed files. `backend/appsettings.Production.json`
  is gitignored for this reason.
- **Leaked credentials**: If a credential is ever committed to version control (including
  git history), treat it as compromised and rotate it immediately at the source (database
  provider, Cloudinary, Gmail, etc.). Removing a file from the repository does not invalidate
  the values it contained.
- **CSRF**: Endpoints relying on cookies (like logout and token refresh) are protected by CSRF tokens.

## Deployment Notes

- Use `backend/scripts/deploy.sh` as a reference for production builds.
- Ensure SQL Server has a scheduled backup task using the provided scripts.
