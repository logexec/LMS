#!/bin/bash
set -euo pipefail

echo "==> [1/6] Limpiando recursos viejos..."
docker builder prune -f
docker volume prune -f
docker image prune -f

echo "==> [2/6] Traer último código..."
git fetch origin main
git reset --hard origin/main

echo "==> [3/6] Bajar contenedores antiguos..."
docker compose down --remove-orphans

echo "==> [4/6] Reconstruyendo imágenes sin cache..."
docker compose build --no-cache

echo "==> [5/6] Levantando servicios en background..."
docker compose up -d

echo "==> [6/6] Corrigiendo permisos dentro del contenedor backend..."
docker compose exec backend \
  bash -lc "chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache && \
             chmod -R 775             /var/www/html/storage /var/www/html/bootstrap/cache"

echo "✅ ¡Despliegue completado!"
