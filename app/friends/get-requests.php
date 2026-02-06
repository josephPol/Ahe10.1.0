<?php
require_once __DIR__ . '/helpers.php';
requireAuth();

try {
    $userId = $_SESSION['user_id'];
    $pdo = getDatabase();

    // Obtener solicitudes pendientes recibidas
    $stmt = $pdo->prepare("
        SELECT a.id, a.usuario_id as sender_id, a.creado_en as created_at, u.name, u.email
        FROM amistades a
        INNER JOIN users u ON a.usuario_id = u.id
        WHERE a.amigo_id = :user_id AND a.estado = 'pendiente'
        ORDER BY a.creado_en DESC
    ");
    $stmt->execute([':user_id' => $userId]);
    $requests = $stmt->fetchAll();

    respondSuccess(['requests' => $requests]);

} catch (PDOException $e) {
    handleDatabaseError($e);
}
