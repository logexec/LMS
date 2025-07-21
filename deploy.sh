#!/usr/bin/env bash
set -euo pipefail

# 1) Asegura que existan los dirs vacíos para Git y para el container
mkdir -p backend/storage/logs \
         backend/storage/framework/{sessions,views,cache} \
         backend/bootstrap/cache

echo "==> [1/5] Ajustando permisos para GIT (host)…"
sudo chown -R "$(id -u):$(id -g)" backend/

echo "==> [2/5] Actualizando código desde origin/main…"
git -C backend fetch origin main
git -C backend reset --hard origin/main
echo "    ✔ Código sincronizado"

echo "==> [3/5] Ajustando permisos para PHP-FPM (host)…"
sudo chown -R www-data:www-data \
     backend/storage \
     backend/bootstrap/cache

sudo chmod -R 775 \
     backend/storage \
     backend/bootstrap/cache
echo "    ✔ storage/ y bootstrap/cache listos para escritura por www-data"

echo "==> [4/5] Reconstruyendo y levantando Docker…"
docker compose down --remove-orphans
docker compose build --no-cache
docker compose up -d

echo "✅ Despliegue completo"
