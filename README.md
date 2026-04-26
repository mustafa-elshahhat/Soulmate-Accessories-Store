# Soulmate Accessories Store

A full-stack e-commerce platform specializing in customizable accessory boxes. The project features a modern architecture with a decoupled backend and frontend, and a dedicated microservice for WhatsApp notifications.

## Project Overview

Soulmate Accessories Store provides a seamless shopping experience where customers can purchase individual products or build their own customized accessory boxes. The system handles order management, stock control, and automated communication via WhatsApp.

## Features

- **Custom Box Builder**: Interactive interface to select box types and fill them with products from specific categories.
- **Product Management**: Standalone and builder-specific items with category-based customization prices.
- **Order System**: Complete lifecycle from pending payment to delivery.
- **WhatsApp Notifications**: Automated messages for order status updates and payment verification.
- **Security**: JWT-based authentication, CSRF protection, and internal service hardening.
- **Admin Dashboard**: Manage products, orders, inventory, and system settings.

## Tech Stack

- **Backend**: ASP.NET Core 9.0 Web API, Entity Framework Core, SQL Server.
- **Frontend**: Angular 21 (Standalone components), SSR (Server-Side Rendering), Tailwind CSS.
- **Microservices**: Node.js Express service for WhatsApp integration (via whatsapp-web.js).
- **Storage**: Cloudinary for product and payment receipt images.

## Architecture

The project follows a clean architecture pattern:
- **Client Side**: Angular handles the UI and state management.
- **API Layer**: ASP.NET Core provides RESTful endpoints and handles business logic.
- **Data Layer**: SQL Server managed via EF Core Migrations.
- **Notification Layer**: Node.js service manages a Puppeteer instance for WhatsApp automation.

## Project Structure

```text
/backend            - ASP.NET Core Web API
/frontend           - Angular SPA
/whatsapp-service   - Node.js WhatsApp microservice
/scripts            - Deployment and database maintenance scripts
```

## Environment Variables

### Backend
- `ConnectionStrings:DefaultConnection`: SQL Server connection string.
- `Jwt:Secret`: Secret key for token signing.
- `Cloudinary`: Credentials for image storage.
- `WhatsApp:InternalKey`: Secret key for authenticating with the WhatsApp service.
- `InternalApi:Key`: Key used for internal administrative tasks.

### WhatsApp Service
- `INTERNAL_API_KEY`: Must match the backend's `WhatsApp:InternalKey`.
- `ENABLE_WHATSAPP_PAIRING_UI`: Set to `true` only during initial setup.
- `PAIRING_ADMIN_TOKEN`: Optional extra layer for pairing UI access.

## Setup Instructions

### Backend Setup
1. Navigate to `/backend`.
2. Configure `appsettings.json` with your credentials.
3. Run `dotnet ef database update` to apply migrations.
4. Run `dotnet run` to start the API.

### Frontend Setup
1. Navigate to `/frontend`.
2. Run `npm install`.
3. Configure `proxy.conf.json` if needed.
4. Run `npm start` for development.

### WhatsApp Service Setup
1. Navigate to `/whatsapp-service`.
2. Run `npm install`.
3. Configure `.env` based on `.env.example`.
4. Run `npm start`.

## Testing

Run backend tests using:
```bash
cd backend
dotnet test Tests/SoulmateStore.Tests.csproj
```

Run frontend linting:
```bash
cd frontend
npm run lint
```

## Security Notes

- **Secrets**: sensitive configurations (JWT secrets, API keys, etc.) should be managed via Environment Variables or Secret Manager in production.
- **Internal Communication**: The WhatsApp service is protected by an internal API key and should not be exposed to the public internet without proper firewall rules.
- **CSRF**: Endpoints relying on cookies (like logout and token refresh) are protected by CSRF tokens.

## Deployment Notes

- Use `backend/scripts/deploy.sh` as a reference for production builds.
- Ensure SQL Server has a scheduled backup task using the provided scripts.
- The WhatsApp service requires a stable environment for Puppeteer (e.g., VPS or Render with appropriate memory).
