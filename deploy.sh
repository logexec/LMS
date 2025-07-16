#!/usr/bin/env bash
set -e

cd "$(dirname "$0")"

# 1. Aseguramos main al día
git fetch origin
git checkout main
git pull origin main

# 2. Limpiamos imágenes obsoletas
docker image prune -f

# 3. Reconstruimos y levantamos contenedores
docker compose build --pull backend frontend
docker compose up -d

# 4. Migraciones y cacheos en backend
docker compose exec backend bash -lc "
  php artisan migrate --force &&
  php artisan config:cache &&
  php artisan route:cache &&
  php artisan view:cache
"
