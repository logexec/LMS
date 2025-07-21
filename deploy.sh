#!/usr/bin/env bash
set -euo pipefail

# ——————————————————————————————
# 0) Asegura que onix tenga escritura sobre backend/ (host)
# ——————————————————————————————
echo "➤ [0/6] Asegurando permisos host en backend/…"
sudo chown -R "$(id -u):$(id -g)" backend
sudo chmod -R u+rw backend

# ——————————————————————————————
# 1) Limpia caches obsoletos de Docker
# ——————————————————————————————
echo "➤ [1/6] Limpiando caches obsoletos de Docker…"
docker builder prune --all --filter "until=24h" -f
docker image prune -af
docker volume prune -f

# ——————————————————————————————
# 2) Prepara dirs vacíos y permisos host
# ——————————————————————————————
echo "➤ [2/6] Asegurando carpetas y permisos (host)…"
mkdir -p backend/storage/logs \
         backend/storage/framework/{sessions,views,cache} \
         backend/bootstrap/cache

sudo chown -R www-data:www-data \
     backend/storage backend/bootstrap/cache
sudo chmod -R 775 \
     backend/storage backend/bootstrap/cache

# ——————————————————————————————
# 3) Sincroniza código con origin/main
# ——————————————————————————————
echo "➤ [3/6] Sincronizando código con origin/main…"
git -C backend fetch origin main
git -C backend reset --hard origin/main
echo "    ✔ Código en backend alineado con origin/main"

# ——————————————————————————————
# 4) Reconstruye sólo los servicios que cambian
# ——————————————————————————————
echo "➤ [4/6] Reconstruyendo imágenes (cache habilitado)…"
docker compose build backend frontend

# ——————————————————————————————
# 5) Sube los containers
# ——————————————————————————————
echo "➤ [5/6] Levantando containers…"
docker compose up -d

# ——————————————————————————————
# 6) Ajuste final de permisos _dentro_ del container backend
# ——————————————————————————————
echo "➤ [6/6] Ajustando permisos storage y cache en container backend…"
docker compose exec backend bash -lc "\
  chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache && \
  chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache \
"

echo "✅ Despliegue completado."
