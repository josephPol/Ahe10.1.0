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

	// Crear tabla de suscripciones premium si no existe
	$db->exec(
		'CREATE TABLE IF NOT EXISTS premium_subscriptions (
			id INT AUTO_INCREMENT PRIMARY KEY,
			user_id INT NOT NULL,
			user_name VARCHAR(255) NOT NULL,
			user_email VARCHAR(255) NOT NULL,
			payment_method VARCHAR(30) NOT NULL,
			price DECIMAL(8,2) NOT NULL,
			status VARCHAR(20) NOT NULL DEFAULT "active",
			created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
		)'
	);

	// Asegurar columnas premium en users
	$columns = ['is_premium', 'premium_since'];
	foreach ($columns as $column) {
		$check = $db->prepare("SHOW COLUMNS FROM users LIKE ?");
		$check->execute([$column]);
		if ($check->rowCount() === 0) {
			if ($column === 'is_premium') {
				$db->exec('ALTER TABLE users ADD COLUMN is_premium TINYINT(1) NOT NULL DEFAULT 0');
			}
			if ($column === 'premium_since') {
				$db->exec('ALTER TABLE users ADD COLUMN premium_since DATETIME NULL');
			}
		}
	}

	$db->beginTransaction();

	// Obtener datos actuales del usuario
	$stmtUser = $db->prepare('SELECT id, name, email FROM users WHERE id = ?');
	$stmtUser->execute([$_SESSION['user_id']]);
	$user = $stmtUser->fetch(PDO::FETCH_ASSOC);

	if (!$user) {
		$db->rollBack();
		http_response_code(404);
		echo json_encode([
			'success' => false,
			'message' => 'Usuario no encontrado'
		]);
		exit;
	}

	// Guardar suscripción
	$stmtSub = $db->prepare('INSERT INTO premium_subscriptions (user_id, user_name, user_email, payment_method, price) VALUES (?, ?, ?, ?, ?)');
	$stmtSub->execute([
		$user['id'],
		$user['name'],
		$user['email'],
		$method,
		9.99
	]);

	// Marcar usuario como premium
	$stmt = $db->prepare('UPDATE users SET is_premium = 1, premium_since = NOW(), updated_at = NOW() WHERE id = ?');
	$stmt->execute([$user['id']]);

	$db->commit();

	$_SESSION['is_premium'] = true;

	echo json_encode([
		'success' => true,
		'message' => 'Suscripción Premium activada'
	]);
} catch (PDOException $e) {
	if ($db && $db->inTransaction()) {
		$db->rollBack();
	}
	http_response_code(500);
	echo json_encode([
		'success' => false,
		'message' => 'Error al actualizar la suscripción: ' . $e->getMessage()
	]);
}
