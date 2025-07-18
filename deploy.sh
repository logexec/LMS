#!/bin/bash

echo "==> Limpiando recursos viejos..."
docker builder prune -f
docker volume prune -f
docker image prune -f

echo "==> Haciendo pull del código..."
git pull origin main

echo "==> Reconstruyendo imágenes y levantando servicios..."
docker compose down --remove-orphans
docker compose build --no-cache
docker compose up -d
