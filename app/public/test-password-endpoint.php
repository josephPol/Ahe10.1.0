<?php
// Prueba rápida del endpoint de password-reset

// Agregar headers para debug
header('Content-Type: application/json');

// Capturar errores
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Verificar que el archivo existe
$passwordResetFile = __DIR__ . '/app/public/auth/password-reset.php';

if (!file_exists($passwordResetFile)) {
    echo json_encode([
        'success' => false, 
        'message' => 'Archivo password-reset.php no encontrado',
        'path' => $passwordResetFile
    ]);
    exit;
}

// Verificar config
$configFile = __DIR__ . '/app/public/config/database.php';
if (!file_exists($configFile)) {
    echo json_encode([
        'success' => false, 
        'message' => 'Archivo database.php no encontrado',
        'path' => $configFile
    ]);
    exit;
}

echo json_encode([
    'success' => true,
    'message' => 'Archivos encontrados correctamente',
    'files' => [
        'password-reset' => file_exists($passwordResetFile),
        'database' => file_exists($configFile),
        'mailer' => file_exists(__DIR__ . '/app/public/auth/mailer.php')
    ]
]);
?>
