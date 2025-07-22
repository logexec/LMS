#!/bin/sh
set -e

# Asegura directorios y ownership
for dir in \
  /var/www/html/storage \
  /var/www/html/storage/framework \
  /var/www/html/storage/framework/sessions \
  /var/www/html/storage/framework/views \
  /var/www/html/storage/framework/cache \
  /var/www/html/bootstrap/cache
do
  mkdir -p "$dir"
  chown -R www-data:www-data "$dir"
done

# Lanza el CMD real
exec "$@"
