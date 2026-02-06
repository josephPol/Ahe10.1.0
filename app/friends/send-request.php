<?php
require_once __DIR__ . '/helpers.php';
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
    $stmt = $pdo->prepare("SELECT id FROM users WHERE id = :receiver_id");
    $stmt->execute([':receiver_id' => $receiverId]);
    if (!$stmt->fetch()) {
        respondError('Usuario no encontrado', 404);
    }

    // Verificar si ya son amigos
    $stmt = $pdo->prepare("
        SELECT id FROM amistades 
        WHERE ((usuario_id = :user1 AND amigo_id = :user2) OR (usuario_id = :user2 AND amigo_id = :user1))
        AND estado = 'aceptada'
    ");
    $stmt->execute([':user1' => $senderId, ':user2' => $receiverId]);
    if ($stmt->fetch()) {
        respondError('Ya son amigos', 400);
    }

    // Crear o actualizar solicitud de amistad
    $stmt = $pdo->prepare("
        INSERT INTO amistades (usuario_id, amigo_id, estado, creado_en, actualizado_en)
        VALUES (:sender, :receiver, 'pendiente', NOW(), NOW())
        ON DUPLICATE KEY UPDATE estado = 'pendiente', actualizado_en = NOW()
    ");
    $stmt->execute([
        ':sender' => $senderId,
        ':receiver' => $receiverId
    ]);

    respondSuccess([], 'Solicitud enviada');

} catch (PDOException $e) {
    handleDatabaseError($e);
}
