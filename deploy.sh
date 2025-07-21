#!/usr/bin/env bash
set -euo pipefail

# ——————————————————————————————
# 0) Housekeeping: limpiar cache obsoleta
# ——————————————————————————————
echo "➤ [0/6] Limpiando caches obsoletos de Docker…"
docker builder prune --all --filter "until=24h" -f
docker image prune -af
docker volume prune -f

# ——————————————————————————————
# 1) Prepara dirs vacíos y permisos host
# ——————————————————————————————
echo "➤ [1/6] Asegurando carpetas y permisos (host)…"
mkdir -p backend/storage/logs \
         backend/storage/framework/{sessions,views,cache} \
         backend/bootstrap/cache

sudo chown -R "$(id -u):$(id -g)" backend/
sudo chown -R www-data:www-data \
     backend/storage backend/bootstrap/cache
sudo chmod -R 775 \
     backend/storage backend/bootstrap/cache

# ——————————————————————————————
# 2) Sincroniza código
# ——————————————————————————————
echo "➤ [2/6] Sincronizando código con origin/main…"
git -C backend fetch origin main
git -C backend reset --hard origin/main
echo "    ✔ Código en backend alineado con origin/main"

# ——————————————————————————————
# 3) Reconstruir servicios Docker (con cache)
# ——————————————————————————————
echo "➤ [3/6] Reconstruyendo imágenes (cache habilitado)…"
docker compose build backend frontend

# ——————————————————————————————
# 4) Levantar todo
# ——————————————————————————————
echo "➤ [4/6] Levantando containers…"
docker compose up -d

# ——————————————————————————————
# 5) Ajuste final de permisos dentro del container
# ——————————————————————————————
echo "➤ [5/6] Ajustando permisos storage y cache en container backend…"
docker compose exec backend bash -lc "\
  chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache && \
  chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache \
"

echo "✅ Despliegue completado."
