#!/usr/bin/env bash
# rebuild.sh
# Prune and rebuild all containers from scratch

set -euo pipefail

echo "🧹 Stopping and removing containers, volumes, and images..."
podman-compose down --volumes --rmi all 2>/dev/null || podman compose down --volumes --rmi all 2>/dev/null || true

echo "🧼 Pruning dangling resources..."
podman system prune -f

echo "🔨 Rebuilding from scratch..."
podman-compose build --no-cache || podman compose build --no-cache

echo "🚀 Starting services..."
podman-compose up -d || podman compose up -d

echo "⏳ Waiting for database to be healthy..."
sleep 5

echo "📦 Running Prisma migrations..."
podman-compose exec api npx prisma migrate deploy || podman compose exec api npx prisma migrate deploy

echo "✅ All services are running!"
podman-compose ps || podman compose ps
