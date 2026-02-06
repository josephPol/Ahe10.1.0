<?php
require_once __DIR__ . '/helpers.php';
header('Content-Type: application/json; charset=utf-8');
requireAuth();

try {
    $userId = $_SESSION['user_id'];
    $pdo = getDatabase();

    // Obtener solicitudes pendientes recibidas
    $stmt = $pdo->prepare("
        SELECT fr.id, fr.sender_id, fr.created_at, u.name, u.email
        FROM friend_requests fr
        INNER JOIN users u ON fr.sender_id = u.id
        WHERE fr.receiver_id = ? AND fr.status = 'pending'
        ORDER BY fr.created_at DESC
    ");
    $stmt->execute([$userId]);
    $requests = $stmt->fetchAll(PDO::FETCH_ASSOC);

    respondSuccess(['requests' => $requests]);

} catch (PDOException $e) {
    handleDatabaseError($e);
}
