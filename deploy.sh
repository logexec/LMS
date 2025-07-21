#!/usr/bin/env bash
set -euo pipefail

# 1) Limpieza de caches de Docker
echo "➤ [1/7] Limpiando caches de Docker…"
docker builder prune --all --filter "until=24h" -f
docker image prune -af
docker volume prune -f

# 2) Asegura que existan los dirs que Laravel necesita en host
echo "➤ [2/7] Creando directorios faltantes…"
mkdir -p backend/storage/logs \
         backend/storage/framework/{sessions,views,cache} \
         backend/bootstrap/cache

# 3) Dale a onix la propiedad completa de backend/ para que git pueda resetear
echo "➤ [3/7] Preparando permisos host para Git…"
sudo chown -R "$(id -u):$(id -g)" backend

# 4) Sincroniza el código con origin/main
echo "➤ [4/7] Sincronizando código…"
git -C backend fetch origin main
git -C backend reset --hard origin/main

# 5) Delega storage y cache a www-data para PHP-FPM
echo "➤ [5/7] Ajustando permisos de storage/cache para PHP-FPM…"
sudo chown -R www-data:www-data backend/storage backend/bootstrap/cache
sudo chmod -R 775      backend/storage backend/bootstrap/cache

# 6) Reconstruye sólo los servicios que cambiaron
echo "➤ [6/7] Reconstruyendo imágenes (cache habilitado)…"
docker compose build backend frontend

# 7) Sube los contenedores y ajusta permisos dentro del container
echo "➤ [7/7] Levantando containers y ajustando permisos internos…"
docker compose up -d
docker compose exec backend bash -lc "\
  chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache && \
  chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache \
"

echo "✅ Despliegue completado."
