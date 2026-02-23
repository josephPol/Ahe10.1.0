<?php
// Configuración de base de datos para PHP puro

// Cargar .env del proyecto si existe
$rootPath = dirname(__DIR__, 3);
$envPath = $rootPath . '/.env';
$env = [];

if (file_exists($envPath)) {
    $lines = file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (str_starts_with(trim($line), '#') || !str_contains($line, '=')) {
            continue;
        }
        [$key, $value] = explode('=', $line, 2);
        $key = trim($key);
        $value = trim($value);
        $value = trim($value, "\"'");
        $env[$key] = $value;
    }
}

$dbConnection = $env['DB_CONNECTION'] ?? 'sqlite';

// SQLite fallback
$dataDir = __DIR__ . '/../data';
if (!is_dir($dataDir)) {
    mkdir($dataDir, 0755, true);
}
define('DB_PATH', $dataDir . '/aje10.db');

if ($dbConnection === 'mysql') {
    define('DB_TYPE', 'mysql');
    define('DB_HOST', $env['DB_HOST'] ?? '127.0.0.1');
    define('DB_PORT', $env['DB_PORT'] ?? '3306');
    define('DB_NAME', $env['DB_DATABASE'] ?? 'aje10');
    define('DB_USER', $env['DB_USERNAME'] ?? 'root');
    define('DB_PASS', $env['DB_PASSWORD'] ?? '');
} else {
    define('DB_TYPE', 'sqlite');
    define('DB_HOST', 'sqlite');
    define('DB_NAME', DB_PATH);
    define('DB_USER', '');
    define('DB_PASS', '');
}
