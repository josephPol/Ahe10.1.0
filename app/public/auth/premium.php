<?php
session_start();

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
	http_response_code(200);
	exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
	http_response_code(405);
	echo json_encode(['success' => false, 'message' => 'Método no permitido']);
	exit;
}

if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true) {
	http_response_code(401);
	echo json_encode(['success' => false, 'message' => 'No autenticado']);
	exit;
}

$payload = json_decode(file_get_contents('php://input'), true) ?: [];
$method = $payload['method'] ?? '';

if ($method === '') {
	http_response_code(400);
	echo json_encode(['success' => false, 'message' => 'Método de pago requerido']);
	exit;
}

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/database-init.php';

try {
	if (DB_TYPE === 'mysql') {
		$dsn = 'mysql:host=' . DB_HOST . ';port=' . DB_PORT . ';dbname=' . DB_NAME . ';charset=utf8mb4';
		$db = new PDO($dsn, DB_USER, DB_PASS, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
	} else {
		initializeDatabase();
		$db = new PDO('sqlite:' . DB_PATH, null, null, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
	}
} catch (PDOException $e) {
	http_response_code(500);
	echo json_encode(['success' => false, 'message' => 'Error de conexión a la base de datos']);
	exit;
}

$userId = $_SESSION['user_id'];

try {
	if (DB_TYPE === 'mysql') {
		$stmt = $db->prepare('UPDATE users SET is_premium = 1, premium_since = NOW(), premium_plan = ?, premium_price = ?, premium_payment_method = ? WHERE id = ?');
		$stmt->execute(['monthly', 9.99, $method, $userId]);
	} else {
		// SQLite antiguo: solo columna premium
		try {
			$stmt = $db->prepare('UPDATE users SET premium = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
			$stmt->execute([$userId]);
		} catch (PDOException $inner) {
			// Si existe el esquema nuevo en SQLite
			$stmt = $db->prepare('UPDATE users SET is_premium = 1, premium_since = CURRENT_TIMESTAMP, premium_plan = ?, premium_price = ?, premium_payment_method = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
			$stmt->execute(['monthly', 9.99, $method, $userId]);
		}
	}

	$_SESSION['is_premium'] = true;
	echo json_encode(['success' => true, 'message' => 'Suscripción activada']);
} catch (PDOException $e) {
	http_response_code(500);
	echo json_encode(['success' => false, 'message' => 'Error al procesar el pago']);
}
