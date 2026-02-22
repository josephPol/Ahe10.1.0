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
        $stmt = $db->query('SELECT j.id, j.nombre, j.descripcion, j.likes, j.created_at, u.name AS autor FROM jugadas j LEFT JOIN users u ON j.user_id = u.id ORDER BY j.id DESC');
        $jugadas = $stmt->fetchAll(PDO::FETCH_ASSOC);
        jsonResponse(true, 'OK', ['jugadas' => $jugadas]);
        break;

    case 'update':
        requireAdmin();
        $jugadaId = (int)($_POST['jugada_id'] ?? 0);
        $nombre = trim($_POST['nombre'] ?? '');
        $descripcion = trim($_POST['descripcion'] ?? '');
        $likes = (int)($_POST['likes'] ?? 0);

        if ($jugadaId <= 0 || $nombre === '' || $descripcion === '') {
            jsonResponse(false, 'Datos inválidos', null, 400);
        }
        if ($likes < 0) {
            jsonResponse(false, 'Likes inválidos', null, 400);
        }

        $stmt = $db->prepare('UPDATE jugadas SET nombre = ?, descripcion = ?, likes = ?, updated_at = NOW() WHERE id = ?');
        $stmt->execute([$nombre, $descripcion, $likes, $jugadaId]);
        jsonResponse(true, 'Jugada actualizada');
        break;

    case 'delete':
        requireAdmin();
        $jugadaId = (int)($_POST['jugada_id'] ?? 0);
        if ($jugadaId <= 0) {
            jsonResponse(false, 'ID inválido', null, 400);
        }

        $stmt = $db->prepare('SELECT imagen FROM jugadas WHERE id = ?');
        $stmt->execute([$jugadaId]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        $stmt = $db->prepare('DELETE FROM jugadas WHERE id = ?');
        $stmt->execute([$jugadaId]);

        if (!empty($row['imagen'])) {
            $storagePath = __DIR__ . '/../../storage/app/public/';
            $filePath = $storagePath . $row['imagen'];
            if (file_exists($filePath)) {
                @unlink($filePath);
            }
        }

        jsonResponse(true, 'Jugada eliminada');
        break;

    default:
        jsonResponse(false, 'Acción no válida', null, 400);
}
