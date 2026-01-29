FROM php:8.2-apache
RUN apt-get update && apt-get install -y git unzip zip libzip-dev libpng-dev libjpeg62-turbo-dev libfreetype6-dev libonig-dev libxml2-dev libicu-dev libcurl4-openssl-dev  && docker-php-ext-configure gd --with-freetype --with-jpeg  && docker-php-ext-install pdo pdo_mysql mbstring zip exif pcntl intl gd  && a2enmod rewrite headers ssl  && rm -rf /var/lib/apt/lists/*
ENV APACHE_DOCUMENT_ROOT=/var/www/html/public
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf
COPY docker/apache/vhost.conf /etc/apache2/sites-available/000-default.conf
COPY docker/apache/ssl.conf /etc/apache2/sites-available/default-ssl.conf
COPY docker/apache/errors/ /var/www/errors/
RUN mkdir -p /etc/apache2/ssl  && openssl req -x509 -nodes -days 3650 -newkey rsa:2048  -keyout /etc/apache2/ssl/selfsigned.key  -out /etc/apache2/ssl/selfsigned.crt  -subj "/C=ES/ST=TFG/L=Local/O=Chess/OU=DAW/CN=localhost"  && a2ensite default-ssl
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer
WORKDIR /var/www/html
RUN chown -R www-data:www-data /var/www && chmod -R 755 /var/www
EXPOSE 80 443
