<?php
require_once __DIR__ . '/helpers.php';
requireAuth();

try {
    $data = json_decode(file_get_contents('php://input'), true);
    $friendId = $data['friend_id'] ?? null;
    $userId = $_SESSION['user_id'];

    if (!$friendId) {
        respondError('ID de amigo requerido', 400);
    }

    $pdo = getDatabase();

    // Eliminar amistad
    $stmt = $pdo->prepare("
        DELETE FROM amistades 
        WHERE ((usuario_id = :user1 AND amigo_id = :user2) OR (usuario_id = :user2 AND amigo_id = :user1))
        AND estado = 'aceptada'
    ");
    $stmt->execute([
        ':user1' => $userId,
        ':user2' => $friendId
    ]);

    respondSuccess([], 'Amigo eliminado');

} catch (PDOException $e) {
    handleDatabaseError($e);
}
