#!/bin/bash
# ============================================================
# Soulmate Store - Production Deployment Script
# ============================================================
set -e

echo "=== Soulmate Store Production Deployment ==="

# Configuration
BACKEND_DIR="./backend"
FRONTEND_DIR="./frontend"
BACKEND_PUBLISH_DIR="./backend/publish"
FRONTEND_DIST_DIR="./frontend/dist/frontend"

# ── Step 1: Backend Build & Publish ──
echo ""
echo "── Building Backend ──"
cd "$BACKEND_DIR"
dotnet restore
dotnet build --configuration Release --no-restore
dotnet publish --configuration Release --output ./publish --no-build
echo "Backend published to: $BACKEND_PUBLISH_DIR"
cd ..

# ── Step 2: Run Backend Tests ──
echo ""
echo "── Running Backend Tests ──"
cd "$BACKEND_DIR/Tests"
dotnet test SoulmateStore.Tests.csproj --configuration Release --no-build --verbosity normal
cd ../..

# ── Step 3: Frontend Build ──
echo ""
echo "── Building Frontend ──"
cd "$FRONTEND_DIR"
npm ci
npm run lint
npx ng test --watch=false
npx ng build --configuration production
echo "Frontend built to: $FRONTEND_DIST_DIR"
cd ..

# ── Step 4: Generate Migration Bundle ──
echo ""
echo "── Generating Migration Bundle ──"
cd "$BACKEND_DIR"
dotnet ef migrations bundle --configuration Release --output ./publish/efbundle --force
echo "Migration bundle created"
cd ..

# ── Step 5: Summary ──
echo ""
echo "=== Build Complete ==="
echo "Backend artifacts:  $BACKEND_PUBLISH_DIR/"
echo "Frontend artifacts: $FRONTEND_DIST_DIR/"
echo ""
echo "Next steps:"
echo "1. Deploy backend to IIS/Azure App Service"
echo "2. Run migration bundle: ./efbundle --connection \"<production-connection-string>\""
echo "3. Deploy frontend to IIS with iisnode / Azure / PM2"
echo "4. Verify health check: curl https://api.soulmate-store.com/api/health"
echo "5. Verify frontend: curl https://soulmate-store.com"
