# Usar PHP 8.2 con Apache como imagen base
FROM php:8.2-apache

# Establecer el directorio de trabajo dentro del contenedor
WORKDIR /var/www/html

# Instalar dependencias del sistema requeridas para extensiones PHP y herramientas
RUN apt-get update && apt-get install -y \
    git curl unzip libzip-dev libonig-dev \
    && rm -rf /var/lib/apt/lists/*

# Instalar extensiones PHP necesarias para Laravel
RUN docker-php-ext-install pdo pdo_mysql mbstring zip && \
    a2enmod rewrite headers

# Instalar Composer globalmente
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

# Configurar la raíz de documentos de Apache para que apunte al directorio public de Laravel
ENV APACHE_DOCUMENT_ROOT=/var/www/html/public
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf

# Copiar el código de la aplicación Laravel
COPY ./app /var/www/html

# Instalar dependencias PHP vía Composer
RUN cd /var/www/html && composer install --no-dev --optimize-autoloader

# Establecer propiedad y permisos adecuados para Laravel
RUN chown -R www-data:www-data /var/www/html && \
    chmod -R 755 /var/www/html/storage /var/www/html/bootstrap/cache

# Exponer puertos HTTP y HTTPS
EXPOSE 80 443

# Iniciar Apache en primer plano
CMD ["apache2-foreground"]
