<?php
// Configuración de base de datos SQLite para PHP puro
// SQLite no requiere host, user, o password - solo un archivo local

// Crear directorio de datos si no existe
$dataDir = __DIR__ . '/../data';
if (!is_dir($dataDir)) {
    mkdir($dataDir, 0755, true);
}

// Ruta de la base de datos SQLite
define('DB_PATH', $dataDir . '/aje10.db');
define('DB_TYPE', 'sqlite');

// Para compatibilidad con antiguos scripts, mantener estas constantes vacías
define('DB_HOST', 'sqlite');
define('DB_NAME', DB_PATH);
define('DB_USER', '');
define('DB_PASS', '');
