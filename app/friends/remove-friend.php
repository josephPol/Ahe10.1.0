<?php
require_once __DIR__ . '/helpers.php';
header('Content-Type: application/json; charset=utf-8');
requireAuth();

try {
    $data = json_decode(file_get_contents('php://input'), true);
    $friendId = $data['friend_id'] ?? null;
    $userId = $_SESSION['user_id'];

    if (!$friendId) {
        respondError('ID de amigo requerido', 400);
    }

    $pdo = getDatabase();

    // Eliminar amistad (en ambas direcciones)
    $stmt = $pdo->prepare("
        DELETE FROM friends 
        WHERE (user_id = ? AND friend_id = ?) 
        OR (user_id = ? AND friend_id = ?)
    ");
    $stmt->execute([$userId, $friendId, $friendId, $userId]);

    respondSuccess([], 'Amigo eliminado');

} catch (PDOException $e) {
    handleDatabaseError($e);
}
