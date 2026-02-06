<?php
require_once __DIR__ . '/helpers.php';
header('Content-Type: application/json; charset=utf-8');
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
        SELECT sender_id FROM friend_requests 
        WHERE id = ? AND receiver_id = ? AND status = 'pending'
    ");
    $stmt->execute([$requestId, $userId]);
    $request = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$request) {
        respondError('Solicitud no encontrada', 404);
    }

    if ($action === 'accept') {
        // Obtener sender_id
        $senderId = $request['sender_id'];
        
        // Actualizar solicitud a accepted
        $stmt = $pdo->prepare("
            UPDATE friend_requests 
            SET status = 'accepted', updated_at = NOW()
            WHERE id = ?
        ");
        $stmt->execute([$requestId]);
        
        // Crear entrada en tabla friends (bidireccional)
        $stmt = $pdo->prepare("
            INSERT INTO friends (user_id, friend_id, created_at, updated_at)
            VALUES (?, ?, NOW(), NOW())
        ");
        $stmt->execute([$userId, $senderId]);
        
        respondSuccess([], 'Solicitud aceptada');
    } else {
        // Rechazar solicitud (eliminar)
        $stmt = $pdo->prepare("
            DELETE FROM friend_requests WHERE id = ?
        ");
        $stmt->execute([$requestId]);
        respondSuccess([], 'Solicitud rechazada');
    }

} catch (PDOException $e) {
    handleDatabaseError($e);
}
