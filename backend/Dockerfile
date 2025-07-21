FROM php:8.2-fpm

# 1) Instala dependencias de sistema y WireGuard
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
       libonig-dev libzip-dev zip unzip \
       libpng-dev libjpeg-dev libfreetype6-dev \
       libxml2-dev gnupg2 curl unixodbc-dev \
       iproute2 wireguard-tools \
    && rm -rf /var/lib/apt/lists/* \
    && printf '%s\n' '#!/bin/sh' 'exit 0' > /usr/sbin/resolvconf \
    && chmod +x /usr/sbin/resolvconf \
    && mkdir -p /etc/wireguard

# 2) SQLSRV, GD, SOAP y extensiones PHP
RUN curl -sSL https://packages.microsoft.com/config/debian/12/packages-microsoft-prod.deb \
    -o packages-microsoft-prod.deb && dpkg -i packages-microsoft-prod.deb \
    && rm packages-microsoft-prod.deb && apt-get update \
    && ACCEPT_EULA=Y apt-get install -y msodbcsql18 \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install gd mbstring pdo_mysql zip exif pcntl soap \
    && pecl install sqlsrv pdo_sqlsrv \
    && docker-php-ext-enable sqlsrv pdo_sqlsrv

# 3) Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# 4) Overrides de PHP (SameSite, secure flag)
RUN echo "session.cookie_samesite=lax" > /usr/local/etc/php/conf.d/z-samesite.ini \
    && echo "session.cookie_secure=0" >> /usr/local/etc/php/conf.d/z-samesite.ini

# 5) Copia la aplicación y fija permisos iniciales
WORKDIR /var/www/html
COPY . .

# 6) Asegura carpetas críticas y permisos
RUN mkdir -p storage/app/facturas \
         storage/logs \
         storage/framework/cache \
         storage/framework/sessions \
         storage/framework/views \
    && chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html \
    && chmod -R 775 storage storage/logs storage/app storage/app/facturas storage/framework \
    && chmod -R 775 bootstrap/cache

# 7) Dependencias PHP via Composer
RUN composer install --no-dev --optimize-autoloader \
    && chown -R www-data:www-data bootstrap storage

# 7.1) Asegura la existencia de los directorios criticos con el script:
COPY docker/entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# 8) Exponer y lanzar PHP-FPM
EXPOSE 9000
CMD ["sh", "-c", "wg-quick up wg0 && php-fpm"]



# # 1. Base PHP con Apache
# FROM php:8.2-apache AS backend

# # 1.1. ServerName y mod_rewrite + headers
# RUN echo "ServerName localhost" >> /etc/apache2/apache2.conf \
#    && a2enmod rewrite headers

# # 2. Instala dependencias de sistema (APT) necesarias para GD, SQLSRV, WireGuard, etc.
# RUN apt-get update \
#    && apt-get install -y --no-install-recommends \
#    libonig-dev libzip-dev zip unzip \
#    libpng-dev libjpeg-dev libfreetype6-dev \
#    libxml2-dev gnupg2 apt-transport-https curl unixodbc-dev \
#    iproute2 wireguard-tools \
#    && rm -rf /var/lib/apt/lists/* \
#    \
#    # Now drop in a stub so wg-quick "resolvconf" calls succeed but do nothing
#    && printf '%s\n' '#!/bin/sh' 'exit 0' > /usr/sbin/resolvconf \
#    && chmod +x /usr/sbin/resolvconf

# # 2.1 Prepara WireGuard
# RUN mkdir -p /etc/wireguard

# # 3. Añade repositorio Microsoft y ODBC Driver
# RUN curl -sSL https://packages.microsoft.com/config/debian/12/packages-microsoft-prod.deb \
#    -o packages-microsoft-prod.deb \
#    && dpkg -i packages-microsoft-prod.deb \
#    && rm packages-microsoft-prod.deb \
#    && apt-get update \
#    && ACCEPT_EULA=Y apt-get install -y msodbcsql18 \
#    && rm -rf /var/lib/apt/lists/*

# # 4. Compila e instala extensiones PHP
# RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
#    && docker-php-ext-install \
#    gd \
#    mbstring \
#    pdo_mysql \
#    zip \
#    exif \
#    pcntl \
#    soap \
#    && pecl install sqlsrv pdo_sqlsrv \
#    && docker-php-ext-enable sqlsrv pdo_sqlsrv

# # 5. (Opcional) Copia Composer para manejar dependencias PHP
# COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# # 6. Configuración de Apache (CORS, vhost, etc.)
# RUN mkdir -p /etc/apache2/conf-available
# COPY docker/apache/cors.conf /etc/apache2/conf-available/cors.conf
# RUN a2enconf cors
# COPY docker/apache/vhost.conf /etc/apache2/sites-available/000-default.conf

# # 7. Copia el código y fija permisos
# WORKDIR /var/www/html

# # 7.1. Forzar SameSite=None y secure=false para la cookie de sesión
# RUN { \
#    echo "session.cookie_samesite=None"; \
#    echo "session.cookie_secure=0"; \
#    } > /usr/local/etc/php/conf.d/z-session-overrides.ini

# COPY . /var/www/html
# RUN chown -R www-data:www-data /var/www/html \
#    && chmod -R 755 /var/www/html

# # Para crear el directorio de facturas y almacenar los xml de manera temporal
# RUN mkdir -p /var/www/html/storage/app/facturas \
#    && chown -R www-data:www-data /var/www/html/storage/app/facturas \
#    && chmod -R 775 /var/www/html/storage/app/facturas

# # 8. Instala paquetes PHP via Composer
# RUN composer install --no-interaction --optimize-autoloader --no-dev

# # 9. Exponer y arrancar Apache
# EXPOSE 80
# CMD wg-quick up wg0 || true && apache2-foreground
