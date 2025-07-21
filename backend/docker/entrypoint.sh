#!/bin/sh
set -e

# Dentro del contenedor, como root, se asegura de que se tengan permisos y existan:
for dir in \
    /var/www/html/storage \
    /var/www/html/storage/framework \
    /var/www/html/storage/framework/sessions \
    /var/www/html/storage/framework/views \
    /var/www/html/storage/framework/cache \
    /var/www/html/bootstrap/cache
do
    mkdir -p "$dir"
    chwon -R www-data:www-data "$dir"
done

# Despues se delega el comando original (php-fpm)
exec "@"