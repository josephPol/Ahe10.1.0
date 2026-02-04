<?php
/**
 * Script de prueba interactivo de autenticación
 * Permite probar registro, login y logout sin interfaz gráfica
 */

session_start();

require_once __DIR__ . '/app/public/config/database.php';

class AuthTester {
    private $db;
    private $testResults = [];

    public function __construct() {
        try {
            $this->db = new PDO(
                'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8',
                DB_USER,
                DB_PASS,
                [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
            );
            $this->addResult('Conexión BD', true, 'Conectado exitosamente');
        } catch (PDOException $e) {
            die('Error: ' . $e->getMessage());
        }
    }

    public function testTableExists() {
        try {
            $stmt = $this->db->query("DESC users");
            $this->addResult('Tabla users', true, 'Tabla existe');
            return true;
        } catch (PDOException $e) {
            $this->addResult('Tabla users', false, 'Tabla no existe: ' . $e->getMessage());
            return false;
        }
    }

    public function testRegister($name, $email, $password) {
        try {
            // Validar
            if (strlen($password) < 8) {
                return ['success' => false, 'message' => 'Contraseña muy corta'];
            }

            // Verificar si existe
            $stmt = $this->db->prepare('SELECT id FROM users WHERE email = ?');
            $stmt->execute([$email]);
            if ($stmt->rowCount() > 0) {
                return ['success' => false, 'message' => 'Email ya registrado'];
            }

            // Crear usuario
            $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
            $stmt = $this->db->prepare('INSERT INTO users (name, email, password, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())');
            $stmt->execute([$name, $email, $hashedPassword]);

            $userId = $this->db->lastInsertId();
            $this->addResult("Registro: $email", true, "Usuario creado (ID: $userId)");
            return ['success' => true, 'userId' => $userId];
        } catch (PDOException $e) {
            $this->addResult("Registro: $email", false, $e->getMessage());
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }

    public function testLogin($email, $password) {
        try {
            $stmt = $this->db->prepare('SELECT id, name, password FROM users WHERE email = ?');
            $stmt->execute([$email]);

            if ($stmt->rowCount() === 0) {
                return ['success' => false, 'message' => 'Usuario no encontrado'];
            }

            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!password_verify($password, $user['password'])) {
                return ['success' => false, 'message' => 'Contraseña incorrecta'];
            }

            $_SESSION['logged_in'] = true;
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['user_name'] = $user['name'];
            $_SESSION['user_email'] = $email;

            $this->addResult("Login: $email", true, "Sesión iniciada");
            return ['success' => true];
        } catch (PDOException $e) {
            $this->addResult("Login: $email", false, $e->getMessage());
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }

    public function testLogout() {
        session_destroy();
        $this->addResult('Logout', true, 'Sesión destruida');
        return ['success' => true];
    }

    public function getUsers() {
        try {
            $stmt = $this->db->query('SELECT id, name, email, created_at FROM users LIMIT 10');
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            return [];
        }
    }

    public function deleteUser($email) {
        try {
            $stmt = $this->db->prepare('DELETE FROM users WHERE email = ?');
            $stmt->execute([$email]);
            $this->addResult("Eliminar: $email", true, 'Usuario eliminado');
            return true;
        } catch (PDOException $e) {
            $this->addResult("Eliminar: $email", false, $e->getMessage());
            return false;
        }
    }

    private function addResult($test, $success, $message) {
        $this->testResults[] = [
            'test' => $test,
            'success' => $success,
            'message' => $message
        ];
    }

    public function getResults() {
        return $this->testResults;
    }
}

// Procesar acciones
$action = $_GET['action'] ?? $_POST['action'] ?? null;
$tester = new AuthTester();
$response = null;

switch ($action) {
    case 'test_table':
        $tester->testTableExists();
        break;

    case 'register':
        $name = $_POST['name'] ?? '';
        $email = $_POST['email'] ?? '';
        $password = $_POST['password'] ?? '';
        $response = $tester->testRegister($name, $email, $password);
        break;

    case 'login':
        $email = $_POST['email'] ?? '';
        $password = $_POST['password'] ?? '';
        $response = $tester->testLogin($email, $password);
        break;

    case 'logout':
        $response = $tester->testLogout();
        break;

    case 'delete':
        $email = $_POST['email'] ?? '';
        $tester->deleteUser($email);
        break;
}

// Si es una petición AJAX
if (!empty($action) && (isset($_GET['ajax']) || isset($_POST['ajax']))) {
    header('Content-Type: application/json');
    echo json_encode($response ?? $tester->getResults());
    exit();
}

// Mostrar interface HTML
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tester de Autenticación - AJE10</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        .container {
            max-width: 900px;
            margin: 0 auto;
            background: white;
            border-radius: 10px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            font-size: 2em;
            margin-bottom: 10px;
        }
        .content {
            padding: 30px;
        }
        .section {
            margin-bottom: 30px;
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 20px;
            background: #f9f9f9;
        }
        .section h2 {
            color: #333;
            margin-bottom: 15px;
            border-bottom: 2px solid #667eea;
            padding-bottom: 10px;
        }
        .form-group {
            margin-bottom: 15px;
        }
        .form-group label {
            display: block;
            margin-bottom: 5px;
            color: #333;
            font-weight: bold;
        }
        .form-group input {
            width: 100%;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 5px;
            font-size: 1em;
        }
        .form-group input:focus {
            outline: none;
            border-color: #667eea;
            box-shadow: 0 0 5px rgba(102, 126, 234, 0.3);
        }
        .button-group {
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
        }
        button {
            padding: 10px 20px;
            border: none;
            border-radius: 5px;
            background: #667eea;
            color: white;
            cursor: pointer;
            font-size: 1em;
            font-weight: bold;
            transition: background 0.3s;
        }
        button:hover {
            background: #764ba2;
        }
        .button-danger {
            background: #e74c3c;
        }
        .button-danger:hover {
            background: #c0392b;
        }
        .result {
            background: white;
            border: 1px solid #ddd;
            border-radius: 5px;
            padding: 15px;
            margin: 10px 0;
        }
        .result.success {
            border-left: 4px solid #27ae60;
            background: #e8f5e9;
        }
        .result.error {
            border-left: 4px solid #e74c3c;
            background: #ffebee;
        }
        .users-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
        }
        .users-table th,
        .users-table td {
            padding: 10px;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }
        .users-table th {
            background: #667eea;
            color: white;
        }
        .users-table tr:hover {
            background: #f5f5f5;
        }
        .status {
            display: inline-block;
            padding: 5px 10px;
            border-radius: 3px;
            color: white;
            font-size: 0.9em;
        }
        .status.logged-in {
            background: #27ae60;
        }
        .status.logged-out {
            background: #95a5a6;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🧪 Tester de Autenticación</h1>
            <p>AJE10 - Pruebas de Sistema</p>
        </div>

        <div class="content">
            <!-- Status actual -->
            <div class="section">
                <h2>📊 Estado Actual</h2>
                <p>
                    <strong>Sesión:</strong>
                    <?php
                    if (isset($_SESSION['logged_in']) && $_SESSION['logged_in']) {
                        echo '<span class="status logged-in">✓ Autenticado</span>';
                        echo '<br><strong>Usuario:</strong> ' . htmlspecialchars($_SESSION['user_name']);
                        echo '<br><strong>Email:</strong> ' . htmlspecialchars($_SESSION['user_email']);
                    } else {
                        echo '<span class="status logged-out">✗ No autenticado</span>';
                    }
                    ?>
                </p>
            </div>

            <!-- Registro -->
            <div class="section">
                <h2>📝 Registrar Usuario</h2>
                <form method="POST">
                    <input type="hidden" name="action" value="register">
                    <div class="form-group">
                        <label>Nombre</label>
                        <input type="text" name="name" placeholder="Juan Pérez" required>
                    </div>
                    <div class="form-group">
                        <label>Email</label>
                        <input type="email" name="email" placeholder="juan@example.com" required>
                    </div>
                    <div class="form-group">
                        <label>Contraseña</label>
                        <input type="password" name="password" placeholder="Mínimo 8 caracteres" required>
                    </div>
                    <button type="submit">Registrar</button>
                </form>
            </div>

            <!-- Login -->
            <div class="section">
                <h2>🔐 Iniciar Sesión</h2>
                <form method="POST">
                    <input type="hidden" name="action" value="login">
                    <div class="form-group">
                        <label>Email</label>
                        <input type="email" name="email" placeholder="juan@example.com" required>
                    </div>
                    <div class="form-group">
                        <label>Contraseña</label>
                        <input type="password" name="password" required>
                    </div>
                    <button type="submit">Entrar</button>
                </form>
            </div>

            <!-- Logout -->
            <div class="section">
                <h2>🚪 Cerrar Sesión</h2>
                <?php if (isset($_SESSION['logged_in']) && $_SESSION['logged_in']): ?>
                    <p>Estás autenticado como <strong><?php echo htmlspecialchars($_SESSION['user_name']); ?></strong></p>
                    <form method="POST" style="display: inline;">
                        <input type="hidden" name="action" value="logout">
                        <button type="submit" class="button-danger">Cerrar Sesión</button>
                    </form>
                <?php else: ?>
                    <p style="color: #999;">No hay sesión activa</p>
                <?php endif; ?>
            </div>

            <!-- Usuarios registrados -->
            <div class="section">
                <h2>👥 Usuarios Registrados</h2>
                <?php
                $users = $tester->getUsers();
                if (!empty($users)):
                ?>
                    <table class="users-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Nombre</th>
                                <th>Email</th>
                                <th>Fecha Registro</th>
                                <th>Acción</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php foreach ($users as $user): ?>
                                <tr>
                                    <td><?php echo $user['id']; ?></td>
                                    <td><?php echo htmlspecialchars($user['name']); ?></td>
                                    <td><?php echo htmlspecialchars($user['email']); ?></td>
                                    <td><?php echo date('d/m/Y H:i', strtotime($user['created_at'])); ?></td>
                                    <td>
                                        <form method="POST" style="display: inline;">
                                            <input type="hidden" name="action" value="delete">
                                            <input type="hidden" name="email" value="<?php echo htmlspecialchars($user['email']); ?>">
                                            <button type="submit" onclick="return confirm('¿Eliminar?')" class="button-danger" style="padding: 5px 10px; font-size: 0.9em;">Eliminar</button>
                                        </form>
                                    </td>
                                </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                <?php else: ?>
                    <p style="color: #999;">No hay usuarios registrados</p>
                <?php endif; ?>
            </div>

            <!-- Resultados -->
            <?php
            $results = $tester->getResults();
            if (!empty($results)):
            ?>
                <div class="section">
                    <h2>📋 Resultados</h2>
                    <?php foreach ($results as $result): ?>
                        <div class="result <?php echo $result['success'] ? 'success' : 'error'; ?>">
                            <strong><?php echo $result['test']; ?>:</strong>
                            <?php echo $result['message']; ?>
                        </div>
                    <?php endforeach; ?>
                </div>
            <?php endif; ?>
        </div>
    </div>
</body>
</html>
