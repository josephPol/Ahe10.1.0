<?php
session_start();

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true) {
    http_response_code(401);
    echo json_encode([
        'success' => false,
        'message' => 'No autenticado'
    ]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Método no permitido'
    ]);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
if (!is_array($input)) {
    $input = $_POST;
}

$method = $input['method'] ?? '';
$allowed = ['apple_pay', 'card', 'paypal'];

if (!in_array($method, $allowed, true)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Método de pago inválido'
    ]);
    exit;
}

require_once __DIR__ . '/../config/database.php';

try {
    $db = new PDO(
        'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8',
        DB_USER,
        DB_PASS,
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );

    $stmt = $db->prepare('UPDATE users SET is_premium = 1, premium_since = NOW(), premium_plan = ?, premium_price = ?, premium_payment_method = ?, updated_at = NOW() WHERE id = ?');
    $stmt->execute(['monthly', 9.99, $method, $_SESSION['user_id']]);

    echo json_encode([
        'success' => true,
        'message' => 'Suscripción Premium activada'
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error al actualizar la suscripción'
    ]);
}
