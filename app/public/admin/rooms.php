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

require_once __DIR__ . '/../config/database.php';

function jsonResponse($success, $message = '', $data = null, $code = 200) {
    http_response_code($code);
    echo json_encode([
        'success' => $success,
        'message' => $message,
        'data' => $data
    ]);
    exit;
}

function requireAdmin() {
    if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true) {
        jsonResponse(false, 'No autenticado', null, 401);
    }
    if (!isset($_SESSION['is_admin']) || $_SESSION['is_admin'] !== true) {
        jsonResponse(false, 'No autorizado', null, 403);
    }
}

try {
    $db = new PDO(
        'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8',
        DB_USER,
        DB_PASS,
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );
} catch (PDOException $e) {
    jsonResponse(false, 'Error de conexión a la base de datos', null, 500);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(false, 'Método no permitido', null, 405);
}

$action = $_POST['action'] ?? '';

switch ($action) {
    case 'list':
        requireAdmin();
        $stmt = $db->query('SELECT id, nombre, descripcion, modo, max_players, status, created_at, updated_at FROM game_rooms ORDER BY id DESC');
        $rooms = $stmt->fetchAll(PDO::FETCH_ASSOC);
        jsonResponse(true, 'OK', ['rooms' => $rooms]);
        break;

    case 'create':
        requireAdmin();
        $nombre = trim($_POST['nombre'] ?? '');
        $descripcion = trim($_POST['descripcion'] ?? '');
        $modo = trim($_POST['modo'] ?? 'local');
        $maxPlayers = (int)($_POST['max_players'] ?? 2);
        $status = trim($_POST['status'] ?? 'activo');

        if ($nombre === '') {
            jsonResponse(false, 'Nombre requerido', null, 400);
        }
        if ($maxPlayers < 2 || $maxPlayers > 8) {
            jsonResponse(false, 'Max jugadores inválido', null, 400);
        }

        $stmt = $db->prepare('INSERT INTO game_rooms (nombre, descripcion, modo, max_players, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, NOW(), NOW())');
        $stmt->execute([$nombre, $descripcion, $modo, $maxPlayers, $status]);
        jsonResponse(true, 'Sala creada');
        break;

    case 'update':
        requireAdmin();
        $roomId = (int)($_POST['room_id'] ?? 0);
        $nombre = trim($_POST['nombre'] ?? '');
        $descripcion = trim($_POST['descripcion'] ?? '');
        $modo = trim($_POST['modo'] ?? 'local');
        $maxPlayers = (int)($_POST['max_players'] ?? 2);
        $status = trim($_POST['status'] ?? 'activo');

        if ($roomId <= 0 || $nombre === '') {
            jsonResponse(false, 'Datos inválidos', null, 400);
        }
        if ($maxPlayers < 2 || $maxPlayers > 8) {
            jsonResponse(false, 'Max jugadores inválido', null, 400);
        }

        $stmt = $db->prepare('UPDATE game_rooms SET nombre = ?, descripcion = ?, modo = ?, max_players = ?, status = ?, updated_at = NOW() WHERE id = ?');
        $stmt->execute([$nombre, $descripcion, $modo, $maxPlayers, $status, $roomId]);
        jsonResponse(true, 'Sala actualizada');
        break;

    case 'delete':
        requireAdmin();
        $roomId = (int)($_POST['room_id'] ?? 0);
        if ($roomId <= 0) {
            jsonResponse(false, 'ID inválido', null, 400);
        }
        $stmt = $db->prepare('DELETE FROM game_rooms WHERE id = ?');
        $stmt->execute([$roomId]);
        jsonResponse(true, 'Sala eliminada');
        break;

    default:
        jsonResponse(false, 'Acción no válida', null, 400);
}
