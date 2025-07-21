#!/bin/bash
set -euo pipefail

echo "==> [1/6] Reparando permisos en backend/..."
if chown -R "$(id -u):$(id -g)" backend/; then
  echo "    ✔ chown backend/ a $(id -u):$(id -g)"
else
  echo "    ⚠️  No pude chown backend/ (quizá no tengas sudo), sigue de todas formas..."
fi

echo "==> [2/6] Limpiando cachés de Docker (builders, volúmenes, imágenes)…"
docker builder prune -f
docker volume prune -f
docker image prune -f

echo "==> [3/6] Actualizando código desde Git..."
git fetch origin main
git reset --hard origin/main
echo "    ✔ Código alineado con origin/main"

echo "==> [4/6] (Re)construyendo imágenes Docker sin cache…"
docker compose build --no-cache

echo "==> [5/6] Bajando containers huérfanos y subiendo todo en background…"
docker compose down --remove-orphans
docker compose up -d

echo "==> [6/6] ✅ ¡Despliegue completo!"
