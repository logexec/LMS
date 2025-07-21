#!/usr/bin/env bash
set -euo pipefail

echo "➤ [1/10] Limpiando cachés de Docker…"
docker builder prune -f
docker volume prune -f
docker image prune -f

echo "➤ [2/10] Actualizando código desde Git…"
git fetch origin main
git reset --hard origin/main

echo "➤ [3/10] Parando y eliminando containers huérfanos…"
docker compose down --remove-orphans

echo "➤ [4/10] Reconstruyendo imágenes sin cache…"
docker compose build --no-cache

echo "➤ [5/10] Levantando servicios en background…"
docker compose up -d

echo "➤ [6/10] Corrigiendo permisos dentro del container BACKEND…"
docker compose exec backend bash -lc "\
  echo '  • chown storage & cache → www-data:www-data'; \
  chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache; \
  echo '  • chmod 775 storage & cache'; \
  chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache; \
"

echo "➤ [7/10] Recargando Nginx…"
docker compose exec nginx nginx -s reload

echo "➤ [8/10] Limpiando caché de Laravel dentro del container…"
docker compose exec backend bash -lc "\
  php artisan config:clear && \
  php artisan route:clear  && \
  php artisan cache:clear
"

echo "➤ [9/10] Asegurando que exista el archivo de log y tenga permisos…"
docker compose exec backend bash -lc "\
  touch /var/www/html/storage/logs/laravel.log && \
  chown www-data:www-data /var/www/html/storage/logs/laravel.log && \
  chmod 664 /var/www/html/storage/logs/laravel.log
"

echo "✅ [10/10] Despliegue completo y permisos ajustados."
