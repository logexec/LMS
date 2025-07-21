#!/bin/bash
set -euo pipefail

echo "==> [1/6] Reparando permisos en backend/ para el usuario onix…"
sudo chown -R "$(id -u):$(id -g)" backend/

echo "==> [2/6] Limpiando cachés de Docker…"
docker builder prune -f
docker volume prune -f
docker image prune -f

echo "==> [3/6] Trayendo último código y reseteando…"
git -C backend fetch origin main
git -C backend reset --hard origin/main

echo "==> [4/6] (Re)construyendo imágenes sin cache…"
docker compose build --no-cache

echo "==> [5/6] Bajando containers huérfanos y subiendo todo…"
docker compose down --remove-orphans
docker compose up -d

echo "==> [6/6] Ajuste final de permisos dentro del container…"
docker compose exec backend bash -lc "\
  chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache && \
  chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache \
"

echo "✅ Despliegue completo."
