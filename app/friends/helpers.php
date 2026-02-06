<?php
/**
 * Helper para endpoints de la API de amigos
 * Centraliza código común para evitar duplicación
 */

// Iniciar sesión y configurar headers
session_start();
header('Content-Type: application/json');

// Incluir configuración de BD
require_once __DIR__ . '/../../config/database.php';

/**
 * Verificar que el usuario está autenticado
 * Termina la ejecución si no lo está
 */
function requireAuth() {
    if (!isset($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(['error' => 'No autenticado']);
        exit;
    }
}

/**
 * Obtener conexión a la base de datos
 * @return PDO Conexión PDO
 * @throws PDOException
 */
function getDatabase() {
    $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4";
    return new PDO($dsn, DB_USER, DB_PASS, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);
}

/**
 * Responder con error
 * @param string $message - Mensaje de error
 * @param int $code - Código HTTP
 */
function respondError($message, $code = 400) {
    http_response_code($code);
    echo json_encode(['error' => $message]);
    exit;
}

/**
 * Responder con éxito
 * @param array $data - Datos a retornar
 * @param string $message - Mensaje opcional
 */
function respondSuccess($data = [], $message = '') {
    $response = ['success' => true];
    if (!empty($message)) {
        $response['message'] = $message;
    }
    echo json_encode(array_merge($response, $data));
    exit;
}

/**
 * Manejo centralizado de excepciones PDO
 */
function handleDatabaseError(PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Error al procesar solicitud: ' . $e->getMessage()]);
    exit;
}
