#!/bin/bash
# Script de verificación rápida del sistema de autenticación
# Uso: bash auth-check.sh

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  🔍 VERIFICADOR DE AUTENTICACIÓN - AJE10                      ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# Directorio base
BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo -e "${BLUE}Verificando estructura de archivos...${NC}"
echo ""

# Lista de archivos a verificar
files=(
    "app/public/auth/auth.php"
    "app/public/auth/session.php"
    "app/public/auth/auth.js"
    "app/public/auth/mailer.php"
    "app/public/config/database.php"
    "app/public/html/login.html"
    "app/public/html/registro.html"
    "AUTENTICACION_IMPLEMENTADA.md"
    "SETUP_AUTENTICACION.md"
    "AUTHENTICATION_SETUP.md"
    "setup-users-table.sql"
    "auth-test.php"
    "auth-tester.php"
    "README_AUTENTICACION.txt"
)

missing=0
for file in "${files[@]}"; do
    if [ -f "$BASE_DIR/$file" ]; then
        echo -e "${GREEN}✓${NC} $file"
    else
        echo -e "${RED}✗${NC} $file (FALTA)"
        ((missing++))
    fi
done

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
if [ $missing -eq 0 ]; then
    echo -e "${GREEN}✓ TODOS LOS ARCHIVOS ESTÁN PRESENTES${NC}"
else
    echo -e "${RED}✗ FALTAN $missing ARCHIVO(S)${NC}"
fi
echo "╚════════════════════════════════════════════════════════════════╝"

echo ""
echo -e "${BLUE}📋 PRÓXIMOS PASOS:${NC}"
echo ""
echo "1. Crear tabla en BD:"
echo "   mysql -u root -p aje10 < setup-users-table.sql"
echo ""
echo "2. Verificar configuración:"
echo "   http://localhost/Ahe10.1.0/auth-test.php"
echo ""
echo "3. Probar el sistema:"
echo "   http://localhost/Ahe10.1.0/app/public/html/registro.html"
echo ""
echo "4. Tester interactivo:"
echo "   http://localhost/Ahe10.1.0/auth-tester.php"
echo ""
