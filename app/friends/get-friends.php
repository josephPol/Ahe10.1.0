<?php
require_once __DIR__ . '/helpers.php';
requireAuth();

try {
    $userId = $_SESSION['user_id'];
    $pdo = getDatabase();

    // Obtener lista de amigos
    $stmt = $pdo->prepare("
        SELECT DISTINCT u.id, u.name, u.email, u.created_at, a.creado_en as friendship_date
        FROM users u
        INNER JOIN amistades a ON (
            (a.usuario_id = :user_id AND a.amigo_id = u.id)
            OR (a.amigo_id = :user_id2 AND a.usuario_id = u.id)
        )
        WHERE u.id != :user_id3 AND a.estado = 'aceptada'
        ORDER BY u.name ASC
    ");
    $stmt->execute([
        ':user_id' => $userId,
        ':user_id2' => $userId,
        ':user_id3' => $userId
    ]);

    $friends = $stmt->fetchAll();
    respondSuccess(['friends' => $friends]);

} catch (PDOException $e) {
    handleDatabaseError($e);
}
