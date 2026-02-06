<?php
require_once __DIR__ . '/helpers.php';
requireAuth();

try {
    $data = json_decode(file_get_contents('php://input'), true);
    $requestId = $data['request_id'] ?? null;
    $action = $data['action'] ?? null;
    $userId = $_SESSION['user_id'];

    if (!$requestId || !in_array($action, ['accept', 'reject'])) {
        respondError('Datos inválidos', 400);
    }

    $pdo = getDatabase();

    // Verificar que la solicitud existe y es para este usuario
    $stmt = $pdo->prepare("
        SELECT usuario_id as sender_id, amigo_id as receiver_id FROM amistades 
        WHERE id = :request_id AND amigo_id = :user_id AND estado = 'pendiente'
    ");
    $stmt->execute([':request_id' => $requestId, ':user_id' => $userId]);
    $request = $stmt->fetch();

    if (!$request) {
        respondError('Solicitud no encontrada', 404);
    }

    if ($action === 'accept') {
        // Actualizar solicitud a aceptada
        $stmt = $pdo->prepare("
            UPDATE amistades 
            SET estado = 'aceptada', actualizado_en = NOW()
            WHERE id = :request_id
        ");
        $stmt->execute([':request_id' => $requestId]);
        respondSuccess([], 'Solicitud aceptada');
    } else {
        // Rechazar solicitud (eliminar)
        $stmt = $pdo->prepare("
            DELETE FROM amistades WHERE id = :request_id
        ");
        $stmt->execute([':request_id' => $requestId]);
        respondSuccess([], 'Solicitud rechazada');
    }

} catch (PDOException $e) {
    handleDatabaseError($e);
}
