#!/bin/bash

set -euo pipefail

# 0. Ensure script is run from repo root
REPO_ROOT="$(dirname "$0")"
cd "$REPO_ROOT"

echo "==> [1/8] Granting write permissions to backend directory..."
# Give current user write permission so git pull can overwrite
chmod -R u+rwX backend || echo "⚠️ Warning: unable to chmod backend directory"

echo "==> [2/8] Cleaning up old Docker resources..."
docker builder prune -f
docker volume prune -f
docker image prune -f

echo "==> [3/8] Fetching latest code from origin/main..."
git fetch origin main
# Reset hard to remote to avoid merge conflicts
git reset --hard origin/main

echo "==> [4/8] Bringing down existing containers (and removing orphans)..."
docker compose down --remove-orphans

echo "==> [5/8] Rebuilding images (no cache)..."
docker compose build --no-cache

echo "==> [6/8] Starting services in detached mode..."
docker compose up -d

echo "==> [7/8] Fixing storage & cache permissions inside container..."
docker compose exec backend \
  chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache && \
  chmod -R 775             /var/www/html/storage /var/www/html/bootstrap/cache

echo "[8/8] ✅ Permissions fixed, logs and sessions should now be writable."