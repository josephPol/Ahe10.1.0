<?php
require_once __DIR__ . '/helpers.php';
header('Content-Type: application/json; charset=utf-8');
requireAuth();

try {
    $userId = $_SESSION['user_id'];
    $pdo = getDatabase();

    // Obtener lista de amigos desde la tabla friends
    $stmt = $pdo->prepare("
        SELECT u.id, u.name, u.email, u.created_at, f.created_at as friendship_date
        FROM users u
        INNER JOIN friends f ON (
            (f.user_id = ? AND f.friend_id = u.id)
            OR (f.user_id = u.id AND f.friend_id = ?)
        )
        WHERE u.id != ?
        ORDER BY u.name ASC
    ");
    $stmt->execute([$userId, $userId, $userId]);

    $friends = $stmt->fetchAll(PDO::FETCH_ASSOC);
    respondSuccess(['friends' => $friends]);

} catch (PDOException $e) {
    handleDatabaseError($e);
}
