<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Método no permitido']);
    exit;
}

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/database-init.php';

try {
    if (DB_TYPE === 'mysql') {
        $dsn = 'mysql:host=' . DB_HOST . ';port=' . DB_PORT . ';dbname=' . DB_NAME . ';charset=utf8mb4';
        $db = new PDO($dsn, DB_USER, DB_PASS, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);

        $columns = $db->query("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users'")->fetchAll(PDO::FETCH_COLUMN);
        $required = ['wins', 'losses', 'draws', 'total_games', 'rating'];
        $missing = array_diff($required, $columns);
        if (!empty($missing)) {
            foreach ($missing as $column) {
                switch ($column) {
                    case 'wins':
                    case 'losses':
                    case 'draws':
                    case 'total_games':
                        $db->exec("ALTER TABLE users ADD COLUMN {$column} INT DEFAULT 0");
                        break;
                    case 'rating':
                        $db->exec("ALTER TABLE users ADD COLUMN rating INT DEFAULT 1200");
                        break;
                }
            }
        }
    } else {
        initializeDatabase();
        $db = new PDO('sqlite:' . DB_PATH, null, null, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);

        $info = $db->query("PRAGMA table_info(users)")->fetchAll(PDO::FETCH_ASSOC);
        $columns = array_map(fn($row) => $row['name'], $info);
        $required = ['wins', 'losses', 'draws', 'total_games', 'rating'];
        $missing = array_diff($required, $columns);
        foreach ($missing as $column) {
            switch ($column) {
                case 'wins':
                case 'losses':
                case 'draws':
                case 'total_games':
                    $db->exec("ALTER TABLE users ADD COLUMN {$column} INTEGER DEFAULT 0");
                    break;
                case 'rating':
                    $db->exec("ALTER TABLE users ADD COLUMN rating INTEGER DEFAULT 1200");
                    break;
            }
        }
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error de conexión a la base de datos']);
    exit;
}

try {
    $stmt = $db->query('SELECT name, wins, losses, draws, total_games, rating FROM users WHERE COALESCE(is_admin, 0) = 0 ORDER BY wins DESC, rating DESC LIMIT 10');
    $players = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $data = array_map(function ($user) {
        $total = (int)($user['total_games'] ?? 0);
        $wins = (int)($user['wins'] ?? 0);
        $winRate = $total > 0 ? round(($wins / $total) * 100, 1) : 0;
        return [
            'name' => $user['name'] ?? 'Player',
            'wins' => (int)($user['wins'] ?? 0),
            'losses' => (int)($user['losses'] ?? 0),
            'draws' => (int)($user['draws'] ?? 0),
            'total_games' => $total,
            'rating' => (int)($user['rating'] ?? 1200),
            'win_rate' => $winRate
        ];
    }, $players);

    echo json_encode(['success' => true, 'data' => $data]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error al obtener rankings']);
}
