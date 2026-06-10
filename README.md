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
- `ConnectionStrings:DefaultConnection`: SQL Server connection string.
- `Jwt:Secret`: Secret key for token signing.
- `Cloudinary`: Credentials for image storage.
- `Mail`: SMTP credentials for outbound email notifications.
- `InternalApi:Key`: Key used for internal administrative tasks.

## Setup Instructions

### Backend Setup
1. Navigate to `/backend`.
2. Configure `appsettings.json` with your credentials (e.g. SQL Server connection, JWT Secret, Cloudinary keys).
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

- **Secrets**: sensitive configurations (JWT secrets, API keys, etc.) should be managed via Environment Variables or Secret Manager in production.
- **CSRF**: Endpoints relying on cookies (like logout and token refresh) are protected by CSRF tokens.

## Deployment Notes

- Use `backend/scripts/deploy.sh` as a reference for production builds.
- Ensure SQL Server has a scheduled backup task using the provided scripts.
