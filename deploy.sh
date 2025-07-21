#!/bin/bash
set -euo pipefail

# Dar permisos
if sudo chown -R "$(id -u):$(id -g)" backend/; then
  echo "    ✔ chown backend/ a $(id -u):$(id -g)"
else
  echo "    ⚠️  No pude chown backend/ (quizá no tengas sudo), sigue de todas formas..."
fi

echo "➤ Ajustando permisos de storage y cache…"
sudo chown -R 33:33 backend/storage backend/bootstrap/cache
chmod -R 775 backend/storage backend/bootstrap/cache

echo "➤ Limpiando cachés de Docker…"
docker builder prune -f
docker volume prune -f
docker image prune -f

echo "➤ Actualizando código…"
git fetch origin main
git reset --hard origin/main

echo "➤ Reconstruyendo imágenes…"
docker compose build --no-cache

echo "➤ Levantando servicios…"
docker compose down --remove-orphans
docker compose up -d

echo "➤ Recargando Nginx…"
docker compose exec nginx nginx -s reload

echo "➤ Limpiando caché de Laravel en container…"
docker compose exec backend bash -lc "\
  php artisan config:clear && \
  php artisan route:clear && \
  php artisan cache:clear \
"

echo "✅ Despliegue completo"
