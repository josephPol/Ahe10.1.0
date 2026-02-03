#!/bin/bash

echo "🎮 Configurando el sistema de rankings..."
echo ""

# Ejecutar migraciones
echo "📊 Ejecutando migraciones..."
php artisan migrate --force

# Ejecutar seeders
echo "👥 Creando usuarios de ejemplo..."
php artisan db:seed --class=UserSeeder --force

echo ""
echo "✅ ¡Sistema de rankings configurado correctamente!"
echo ""
echo "Puedes ver el ranking en: http://localhost:8080/inicio"
echo ""
