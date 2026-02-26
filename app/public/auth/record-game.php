<?php
session_start();

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Método no permitido']);
    exit;
}

if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'No autenticado']);
    exit;
}

$payload = json_decode(file_get_contents('php://input'), true) ?: [];
$result = $payload['result'] ?? '';

if (!in_array($result, ['win', 'loss', 'draw'], true)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Resultado inválido']);
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

$userId = $_SESSION['user_id'];
$ratingDelta = $result === 'win' ? 12 : ($result === 'loss' ? -8 : 2);

try {
    if (DB_TYPE === 'mysql') {
        $stmt = $db->prepare('UPDATE users SET wins = wins + ?, losses = losses + ?, draws = draws + ?, total_games = total_games + 1, rating = GREATEST(0, rating + ?) WHERE id = ?');
        $stmt->execute([
            $result === 'win' ? 1 : 0,
            $result === 'loss' ? 1 : 0,
            $result === 'draw' ? 1 : 0,
            $ratingDelta,
            $userId
        ]);
    } else {
        $stmt = $db->prepare('UPDATE users SET wins = wins + ?, losses = losses + ?, draws = draws + ?, total_games = total_games + 1, rating = CASE WHEN rating + ? < 0 THEN 0 ELSE rating + ? END, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
        $stmt->execute([
            $result === 'win' ? 1 : 0,
            $result === 'loss' ? 1 : 0,
            $result === 'draw' ? 1 : 0,
            $ratingDelta,
            $ratingDelta,
            $userId
        ]);
    }

    echo json_encode(['success' => true, 'message' => 'Ranking actualizado']);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error al actualizar ranking']);
}
