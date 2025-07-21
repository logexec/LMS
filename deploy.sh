#!/bin/bash
set -euo pipefail

# … pasos anteriores …

echo "==> [1/6] Asegurando que onix posee storage y cache (host)…"
sudo chown -R "$(id -u):$(id -g)" backend/storage backend/bootstrap/cache

echo "==> [2/6] Limpiando cachés de Docker…"
docker builder prune -f
docker volume prune -f
docker image prune -f

echo "==> [3/6] Actualizando código y reset…"
git -C backend fetch origin main
git -C backend reset --hard origin/main

echo "==> [4/6] Reconstruyendo imágenes sin cache…"
docker compose build --no-cache

echo "==> [5/6] Bajar huérfanos y levantar…"
docker compose down --remove-orphans
docker compose up -d

echo "✅ Despliegue completo."
