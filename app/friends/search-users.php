<?php
require_once __DIR__ . '/helpers.php';
header('Content-Type: application/json; charset=utf-8');
requireAuth();

$response = ['success' => false, 'users' => [], 'error' => null];

try {
    $pdo = getDatabase();
    $searchTerm = $_GET['search'] ?? '';
    $currentUserId = $_SESSION['user_id'] ?? null;

    if (!$currentUserId) {
        throw new Exception('Usuario no identificado en sesión');
    }

    if (strlen($searchTerm) < 2) {
        $response['users'] = [];
        $response['success'] = true;
        echo json_encode($response);
        exit;
    }

    // Búsqueda simple: todos los usuarios excepto el actual
    $searchPattern = '%' . addslashes($searchTerm) . '%';
    
    $query = "
        SELECT id, name, email, created_at
        FROM users
        WHERE id != ?
        AND (name LIKE ? OR email LIKE ?)
        ORDER BY name ASC
        LIMIT 10
    ";
    
    $stmt = $pdo->prepare($query);
    $stmt->execute([$currentUserId, $searchPattern, $searchPattern]);
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Para cada usuario, verificar relación en friend_requests
    if (!empty($users)) {
        foreach ($users as &$user) {
            // Buscar solicitud de amistad (en cualquier dirección)
            $relQuery = "
                SELECT status FROM friend_requests
                WHERE (sender_id = ? AND receiver_id = ?)
                OR (sender_id = ? AND receiver_id = ?)
            ";
            $relStmt = $pdo->prepare($relQuery);
            $relStmt->execute([$currentUserId, $user['id'], $user['id'], $currentUserId]);
            $request = $relStmt->fetch(PDO::FETCH_ASSOC);
            
            // Buscar amistad confirmada
            $friendQuery = "
                SELECT id FROM friends
                WHERE (user_id = ? AND friend_id = ?)
                OR (user_id = ? AND friend_id = ?)
            ";
            $friendStmt = $pdo->prepare($friendQuery);
            $friendStmt->execute([$currentUserId, $user['id'], $user['id'], $currentUserId]);
            $friend = $friendStmt->fetch(PDO::FETCH_ASSOC);
            
            // Determinar estado
            if ($friend) {
                $user['request_status'] = 'aceptada';
            } elseif ($request) {
                $user['request_status'] = $request['status'];
            } else {
                $user['request_status'] = null;
            }
        }
    }

    $response['users'] = $users;
    $response['success'] = true;
    echo json_encode($response);
    exit;

} catch (Exception $e) {
    error_log('Error en search-users.php: ' . $e->getMessage());
    $response['error'] = $e->getMessage();
    $response['success'] = false;
    http_response_code(500);
    echo json_encode($response);
    exit;
}
