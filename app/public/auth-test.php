<?php
/**
 * Script de prueba de configuración de autenticación
 * Accede a este archivo desde el navegador para verificar que todo funciona
 */

require_once __DIR__ . '/app/public/config/database.php';

echo "<!DOCTYPE html>
<html lang='es'>
<head>
    <meta charset='UTF-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <title>Verificación de Autenticación - AJE10</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 20px;
            background-color: #f5f5f5;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background-color: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .test {
            margin: 20px 0;
            padding: 15px;
            border-left: 4px solid #3498db;
            background-color: #ecf0f1;
        }
        .success {
            border-left-color: #27ae60;
            background-color: #e8f5e9;
        }
        .error {
            border-left-color: #e74c3c;
            background-color: #ffebee;
        }
        h1 {
            color: #333;
            border-bottom: 2px solid #3498db;
            padding-bottom: 10px;
        }
        h2 {
            color: #555;
            margin-top: 30px;
        }
    </style>
</head>
<body>
    <div class='container'>
        <h1>🔍 Verificación de Sistema de Autenticación AJE10</h1>";

// Test 1: Verificar archivo de configuración
echo "<h2>1. Configuración de Base de Datos</h2>";
echo "<div class='test success'>";
echo "<strong>✓ Archivo de configuración encontrado</strong><br>";
echo "Host: " . htmlspecialchars(DB_HOST) . "<br>";
echo "Base de Datos: " . htmlspecialchars(DB_NAME) . "<br>";
echo "Usuario: " . htmlspecialchars(DB_USER) . "<br>";
echo "</div>";

// Test 2: Conectar a BD
echo "<h2>2. Conexión a Base de Datos</h2>";
try {
    $pdo = new PDO(
        'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8',
        DB_USER,
        DB_PASS,
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );
    echo "<div class='test success'>";
    echo "<strong>✓ Conexión a base de datos exitosa</strong>";
    echo "</div>";
    
    // Test 3: Verificar tabla users
    echo "<h2>3. Tabla de Usuarios</h2>";
    $stmt = $pdo->query("SELECT COUNT(*) as total FROM users");
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    echo "<div class='test success'>";
    echo "<strong>✓ Tabla 'users' existe</strong><br>";
    echo "Total de usuarios: " . $result['total'];
    echo "</div>";
    
} catch (PDOException $e) {
    echo "<div class='test error'>";
    echo "<strong>✗ Error de conexión:</strong><br>";
    echo htmlspecialchars($e->getMessage());
    echo "</div>";
}

// Test 4: Verificar archivos necesarios
echo "<h2>4. Archivos del Sistema</h2>";
$files = [
    'app/public/auth/auth.php' => 'Controlador de autenticación',
    'app/public/auth/session.php' => 'Verificador de sesión',
    'app/public/auth/auth.js' => 'Script de UI',
    'app/public/auth/mailer.php' => 'Sistema de correos',
    'app/public/config/database.php' => 'Configuración de BD',
];

foreach ($files as $file => $description) {
    $path = __DIR__ . '/' . $file;
    if (file_exists($path)) {
        echo "<div class='test success'>";
        echo "<strong>✓</strong> " . $description . " (" . $file . ")";
        echo "</div>";
    } else {
        echo "<div class='test error'>";
        echo "<strong>✗</strong> Archivo no encontrado: " . $file;
        echo "</div>";
    }
}

// Test 5: Verificar función mail()
echo "<h2>5. Configuración de Correo</h2>";
if (function_exists('mail')) {
    echo "<div class='test success'>";
    echo "<strong>✓</strong> Función mail() disponible<br>";
    echo "<small>Nota: El correo real se enviará si tu servidor SMTP está configurado</small>";
    echo "</div>";
} else {
    echo "<div class='test error'>";
    echo "<strong>✗</strong> Función mail() no disponible";
    echo "</div>";
}

// Test 6: Links de prueba
echo "<h2>6. Enlaces de Prueba</h2>";
echo "<div class='test'>";
echo "<p><strong>Acciones rápidas:</strong></p>";
echo "<ul>";
echo "<li><a href='app/public/html/registro.html' target='_blank'>Ir a página de Registro</a></li>";
echo "<li><a href='app/public/html/login.html' target='_blank'>Ir a página de Login</a></li>";
echo "<li><a href='app/public/html/inicio.html' target='_blank'>Ir a Inicio</a></li>";
echo "</ul>";
echo "</div>";

echo "</div>
</body>
</html>";
