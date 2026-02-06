<?php
require_once __DIR__ . '/helpers.php';
requireAuth();

try {
    $pdo = getDatabase();

    $searchTerm = $_GET['search'] ?? '';
    $currentUserId = $_SESSION['user_id'];

    if (strlen($searchTerm) < 2) {
        respondSuccess(['users' => []]);
    }

    // Buscar usuarios excluyendo el usuario actual y sus amigos
    $stmt = $pdo->prepare("
        SELECT DISTINCT u.id, u.name, u.email, u.created_at
        FROM users u
        WHERE u.id != :current_user_id
        AND (u.name LIKE :search OR u.email LIKE :search)
        AND u.id NOT IN (
            SELECT amigo_id FROM amistades WHERE usuario_id = :user_id1 AND estado = 'aceptada'
            UNION
            SELECT usuario_id FROM amistades WHERE amigo_id = :user_id2 AND estado = 'aceptada'
        )
        LIMIT 10
    ");
    
    $searchPattern = '%' . $searchTerm . '%';
    $stmt->execute([
        ':current_user_id' => $currentUserId,
        ':search' => $searchPattern,
        ':user_id1' => $currentUserId,
        ':user_id2' => $currentUserId
    ]);

    $users = $stmt->fetchAll();

    // Verificar si ya hay solicitud pendiente
    foreach ($users as &$user) {
        $stmt = $pdo->prepare("
            SELECT estado FROM amistades 
            WHERE (usuario_id = :current_user AND amigo_id = :user_id)
            OR (usuario_id = :user_id AND amigo_id = :current_user)
        ");
        $stmt->execute([
            ':current_user' => $currentUserId,
            ':user_id' => $user['id']
        ]);
        $request = $stmt->fetch();
        $user['request_status'] = $request ? $request['estado'] : null;
    }

    respondSuccess(['users' => $users]);

} catch (PDOException $e) {
    handleDatabaseError($e);
}
