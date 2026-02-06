<?php
require_once __DIR__ . '/helpers.php';
header('Content-Type: application/json; charset=utf-8');
requireAuth();

try {
    $data = json_decode(file_get_contents('php://input'), true);
    $receiverId = $data['receiver_id'] ?? null;
    $senderId = $_SESSION['user_id'];

    if (!$receiverId) {
        respondError('ID de usuario requerido', 400);
    }

    $pdo = getDatabase();

    // Verificar que el usuario receptor existe
    $stmt = $pdo->prepare("SELECT id FROM users WHERE id = ?");
    $stmt->execute([$receiverId]);
    if (!$stmt->fetch()) {
        respondError('Usuario no encontrado', 404);
    }

    // Verificar si ya son amigos (en tabla friends)
    $stmt = $pdo->prepare("
        SELECT id FROM friends 
        WHERE (user_id = ? AND friend_id = ?) 
        OR (user_id = ? AND friend_id = ?)
    ");
    $stmt->execute([$senderId, $receiverId, $receiverId, $senderId]);
    if ($stmt->fetch()) {
        respondError('Ya son amigos', 400);
    }

    // Verificar si ya hay una solicitud pendiente
    $stmt = $pdo->prepare("
        SELECT id FROM friend_requests 
        WHERE sender_id = ? AND receiver_id = ? AND status = 'pending'
    ");
    $stmt->execute([$senderId, $receiverId]);
    if ($stmt->fetch()) {
        respondError('Solicitud ya enviada', 400);
    }

    // Crear solicitud de amistad
    $stmt = $pdo->prepare("
        INSERT INTO friend_requests (sender_id, receiver_id, status, created_at, updated_at)
        VALUES (?, ?, 'pending', NOW(), NOW())
    ");
    $stmt->execute([$senderId, $receiverId]);

    respondSuccess([], 'Solicitud enviada');

} catch (PDOException $e) {
    handleDatabaseError($e);
}
