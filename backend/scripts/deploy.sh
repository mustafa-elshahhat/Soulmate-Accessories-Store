#!/bin/bash
# ============================================================
# Soulmate Store - Backend Production Build Script
# Run from the /backend directory.
# The frontend is deployed separately to Vercel (see README).
# ============================================================
set -e

echo "=== Soulmate Store Backend Production Build ==="

# -- Step 1: Restore, Build & Test --
dotnet restore
dotnet build --configuration Release --no-restore
dotnet test Tests/SoulmateStore.Tests.csproj --configuration Release --verbosity normal

# -- Step 2: Publish --
dotnet publish SoulmateStore.csproj --configuration Release --output ./publish
echo "Backend published to: ./publish"

# -- Step 3: Generate Migration Bundle --
dotnet ef migrations bundle --configuration Release --output ./publish/efbundle --force
echo "Migration bundle created: ./publish/efbundle"

echo ""
echo "=== Build Complete ==="
echo "Next steps:"
echo "1. Upload the contents of ./publish to the host (e.g. MonsterASP.NET via WebDeploy/FTP)"
echo "2. Set the production environment variables listed in the README on the host"
echo "3. Migrations run automatically on startup; alternatively run:"
echo "   ./efbundle --connection \"<production-connection-string>\""
echo "4. Verify health check: curl https://<your-backend-domain>/api/health"
