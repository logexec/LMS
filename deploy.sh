#!/usr/bin/env bash
set -euo pipefail

echo "➤ [1/6] Limpiando caches de Docker…"
docker builder prune --all --filter "until=24h" -f
docker image prune -af
docker volume prune -f

echo "➤ [2/6] Ajustando permisos host para Git…"
sudo chown -R "$(id -u):$(id -g)" backend/

echo "➤ [3/6] Sincronizando código con origin/main…"
git -C backend fetch origin main
git -C backend reset --hard origin/main

echo "➤ [4/6] Preparando storage/cache para PHP-FPM…"
sudo chown -R www-data:www-data backend/storage backend/bootstrap/cache
sudo chmod -R 775      backend/storage backend/bootstrap/cache

echo "➤ [5/6] Bajar orphans y reconstruir imágenes…"
docker compose down --remove-orphans
docker compose build backend frontend

echo "➤ [6/6] Levantando containers y ajustando permisos internos…"
docker compose up -d --build
docker compose exec backend bash -lc "\
  chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache && \
  chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache \
"

echo "✅ Despliegue completado."
