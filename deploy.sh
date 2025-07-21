#!/bin/bash
set -euo pipefail

echo "==> [1/6] Limpiando caches de Docker (builders, volúmenes, imágenes)…"
docker builder prune -f
docker volume prune -f
docker image prune -f

echo "==> [2/6] Traer último código de Git y resetear…"
git fetch origin main
git reset --hard origin/main

echo "==> [3/6] Detener y remover containers huérfanos…"
docker compose down --remove-orphans

echo "==> [4/6] Reconstruir imágenes sin cache…"
docker compose build --no-cache

echo "==> [5/6] Levantar servicios en background…"
docker compose up -d

echo "==> [6/6] Corregir permisos dentro del container backend…"
docker compose exec backend bash -lc "\
  chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache && \
  chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache \
"

echo "✅ Despliegue completado."
