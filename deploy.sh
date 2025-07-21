#!/usr/bin/env bash
set -euo pipefail

echo "==> [1/5] Crear dirs si faltan y ajustar permisos (host)…"
mkdir -p backend/storage/logs \
         backend/storage/framework/{sessions,views,cache} \
         backend/bootstrap/cache

sudo chown -R www-data:www-data backend/storage backend/bootstrap/cache
sudo chmod -R 775         backend/storage backend/bootstrap/cache

echo "==> [2/5] Limpiar caches de Docker…"
docker builder prune -f
docker volume  prune -f
docker image   prune -f

echo "==> [3/5] Actualizar código…"
git -C backend fetch origin main
git -C backend reset --hard origin/main

echo "==> [4/5] Reconstruir y subir servicios…"
docker compose down --remove-orphans
docker compose build --no-cache
docker compose up -d

echo "✅ Despliegue completado."
