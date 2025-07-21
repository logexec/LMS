#!/usr/bin/env bash
set -euo pipefail

echo "➤ [1/7] Limpiando caches de Docker…"
docker builder prune --all --filter "until=24h" -f
docker image prune -af
docker volume prune -f

echo "➤ [2/7] Creando dirs faltantes en host…"
mkdir -p backend/storage/logs \
         backend/storage/framework/{sessions,views,cache} \
         backend/bootstrap/cache

echo "➤ [3/7] Ajustando permisos host para Git…"
sudo chown -R "$(id -u):$(id -g)" backend/

echo "➤ [4/7] Sincronizando código con origin/main…"
git -C backend fetch origin main
git -C backend reset --hard origin/main

echo "➤ [5/7] Preparando storage/cache para PHP-FPM…"
sudo chown -R www-data:www-data backend/storage backend/bootstrap/cache
sudo chmod -R 775      backend/storage backend/bootstrap/cache

echo "➤ [6/7] Bajar orphans y reconstruir imágenes…"
docker compose down --remove-orphans
docker compose build backend frontend

echo "➤ [7/7] Levantando containers y ajustando permisos internos…"
docker compose up -d
docker compose exec backend bash -lc "\
  chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache && \
  chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache \
"

echo "✅ Despliegue completado."
