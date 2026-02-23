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
require_once __DIR__ . '/../config/database-init.php';

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
    if (DB_TYPE === 'mysql') {
        $dsn = 'mysql:host=' . DB_HOST . ';port=' . DB_PORT . ';dbname=' . DB_NAME . ';charset=utf8mb4';
        $db = new PDO($dsn, DB_USER, DB_PASS, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
        $check = $db->query("SHOW TABLES LIKE 'users'");
        if ($check->rowCount() === 0) {
            initializeDatabase();
            $db = new PDO(
                'sqlite:' . DB_PATH,
                null,
                null,
                [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
            );
        }
    } else {
        initializeDatabase();
        $db = new PDO(
            'sqlite:' . DB_PATH,
            null,
            null,
            [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
        );
    }
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
        $stmt = $db->query('SELECT id, name, email, is_admin, created_at, updated_at FROM users ORDER BY id DESC');
        $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
        jsonResponse(true, 'OK', ['users' => $users]);
        break;

    case 'create':
        requireAdmin();
        $name = trim($_POST['name'] ?? '');
        $email = trim($_POST['email'] ?? '');
        $password = $_POST['password'] ?? '';
        $isAdmin = isset($_POST['is_admin']) ? (int)$_POST['is_admin'] : 0;

        if ($name === '' || $email === '' || $password === '') {
            jsonResponse(false, 'Nombre, email y contraseña son obligatorios', null, 400);
        }
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            jsonResponse(false, 'Email inválido', null, 400);
        }
        if (strlen($password) < 8) {
            jsonResponse(false, 'La contraseña debe tener al menos 8 caracteres', null, 400);
        }
        if ($isAdmin !== 0 && $isAdmin !== 1) {
            jsonResponse(false, 'Rol inválido', null, 400);
        }

        $stmt = $db->prepare('SELECT id FROM users WHERE email = ?');
        $stmt->execute([$email]);
        if ($stmt->rowCount() > 0) {
            jsonResponse(false, 'El email ya está registrado', null, 400);
        }

        $hash = password_hash($password, PASSWORD_DEFAULT);
        $stmt = $db->prepare('INSERT INTO users (name, email, password, is_admin, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())');
        $stmt->execute([$name, $email, $hash, $isAdmin]);
        jsonResponse(true, 'Usuario creado');
        break;

    case 'update':
        requireAdmin();
        $userId = (int)($_POST['user_id'] ?? 0);
        $name = trim($_POST['name'] ?? '');
        $email = trim($_POST['email'] ?? '');
        $isAdmin = isset($_POST['is_admin']) ? (int)$_POST['is_admin'] : null;

        if ($userId <= 0 || $name === '' || $email === '' || ($isAdmin !== 0 && $isAdmin !== 1)) {
            jsonResponse(false, 'Datos inválidos', null, 400);
        }
        if ($userId === (int)($_SESSION['user_id'] ?? 0) && $isAdmin === 0) {
            jsonResponse(false, 'No puedes quitarte el rol admin a ti mismo', null, 400);
        }

        $stmt = $db->prepare('UPDATE users SET name = ?, email = ?, is_admin = ?, updated_at = NOW() WHERE id = ?');
        $stmt->execute([$name, $email, $isAdmin, $userId]);
        jsonResponse(true, 'Usuario actualizado');
        break;

    case 'delete':
        requireAdmin();
        $userId = (int)($_POST['user_id'] ?? 0);
        if ($userId <= 0) {
            jsonResponse(false, 'ID inválido', null, 400);
        }
        if ($userId === (int)($_SESSION['user_id'] ?? 0)) {
            jsonResponse(false, 'No puedes eliminar tu propio usuario', null, 400);
        }
        $stmt = $db->prepare('DELETE FROM users WHERE id = ?');
        $stmt->execute([$userId]);
        jsonResponse(true, 'Usuario eliminado');
        break;

    case 'reset_password':
        requireAdmin();
        $userId = (int)($_POST['user_id'] ?? 0);
        $newPassword = trim($_POST['new_password'] ?? '');
        if ($userId <= 0) {
            jsonResponse(false, 'ID inválido', null, 400);
        }
        if (strlen($newPassword) < 8) {
            jsonResponse(false, 'La contraseña debe tener al menos 8 caracteres', null, 400);
        }
        $hash = password_hash($newPassword, PASSWORD_DEFAULT);
        $stmt = $db->prepare('UPDATE users SET password = ?, updated_at = NOW() WHERE id = ?');
        $stmt->execute([$hash, $userId]);
        jsonResponse(true, 'Contraseña actualizada');
        break;

    default:
        jsonResponse(false, 'Acción no válida', null, 400);
}
