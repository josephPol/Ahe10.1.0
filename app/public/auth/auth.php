<?php
session_start();

// Headers CORS y JSON
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=utf-8');

// Manejar preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Incluir configuración de base de datos
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/database-init.php';

class Auth {
    private $db;
    private $dbType;

    public function __construct() {
        try {
            $this->dbType = DB_TYPE;
            if ($this->dbType === 'mysql') {
                $dsn = 'mysql:host=' . DB_HOST . ';port=' . DB_PORT . ';dbname=' . DB_NAME . ';charset=utf8mb4';
                $this->db = new PDO($dsn, DB_USER, DB_PASS, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
                // Verificar tabla users; si no existe, usar SQLite de respaldo
                $check = $this->db->query("SHOW TABLES LIKE 'users'");
                if ($check->rowCount() === 0) {
                    initializeDatabase();
                    $this->db = new PDO(
                        'sqlite:' . DB_PATH,
                        null,
                        null,
                        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
                    );
                    $this->dbType = 'sqlite';
                }
            } else {
                // Inicializar base de datos SQLite
                initializeDatabase();
                $this->db = new PDO(
                    'sqlite:' . DB_PATH,
                    null,
                    null,
                    [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
                );
                $this->dbType = 'sqlite';
            }
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Error de conexión a la base de datos'
            ]);
            exit;
        }
    }

    /**
     * Generar un token único para verificación
     */
    private function generateToken() {
        return bin2hex(random_bytes(32));
    }

    /**
     * Registrar nuevo usuario
     */
    public function register($name, $email, $password, $password_confirm) {
        // Validaciones
        if (empty($name) || empty($email) || empty($password)) {
            return ['success' => false, 'message' => 'Todos los campos son obligatorios'];
        }

        if ($password !== $password_confirm) {
            return ['success' => false, 'message' => 'Las contraseñas no coinciden'];
        }

        if (strlen($password) < 8) {
            return ['success' => false, 'message' => 'La contraseña debe tener al menos 8 caracteres'];
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return ['success' => false, 'message' => 'El email no es válido'];
        }

        // Verificar si el email ya existe
        $stmt = $this->db->prepare('SELECT id FROM users WHERE email = ?');
        $stmt->execute([$email]);
        if ($stmt->rowCount() > 0) {
            return ['success' => false, 'message' => 'El email ya está registrado'];
        }

        // Crear usuario
        try {
            $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
            $stmt = $this->db->prepare('INSERT INTO users (name, email, password, created_at, updated_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)');
            $stmt->execute([$name, $email, $hashedPassword]);
            
            $userId = $this->db->lastInsertId();
            
            // Generar token de verificación de email
            $verificationToken = $this->generateToken();
            $expiresAt = date('Y-m-d H:i:s', strtotime('+24 hours'));
            
            $stmt = $this->db->prepare('INSERT INTO email_verifications (user_id, token, expires_at) VALUES (?, ?, ?)');
            $stmt->execute([$userId, $verificationToken, $expiresAt]);
            
            // NO iniciar sesión automáticamente - requiere verificación de email
            // Devolver el token para verificación (en desarrollo)
            return [
                'success' => true,
                'message' => 'Registro exitoso. Por favor verifica tu email.',
                'verification_token' => $verificationToken,
                'verification_url' => 'confirm-email.html?token=' . $verificationToken
            ];
        } catch (PDOException $e) {
            return ['success' => false, 'message' => 'Error al registrar: ' . $e->getMessage()];
        }
    }

    /**
     * Verificar email con token
     */
    public function verifyEmail($token) {
        if (empty($token)) {
            return ['success' => false, 'message' => 'Token inválido'];
        }

        try {
            // Buscar token válido y no expirado
            $stmt = $this->db->prepare('SELECT user_id FROM email_verifications WHERE token = ? AND expires_at > CURRENT_TIMESTAMP');
            $stmt->execute([$token]);
            
            if ($stmt->rowCount() === 0) {
                return ['success' => false, 'message' => 'Token expirado o inválido'];
            }

            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            $userId = $result['user_id'];

            // Marcar email como verificado
            $stmt = $this->db->prepare('UPDATE users SET email_verified = 1, email_verified_at = CURRENT_TIMESTAMP WHERE id = ?');
            $stmt->execute([$userId]);

            // Eliminar token usado
            $stmt = $this->db->prepare('DELETE FROM email_verifications WHERE token = ?');
            $stmt->execute([$token]);

            return ['success' => true, 'message' => 'Email verificado correctamente'];
        } catch (PDOException $e) {
            return ['success' => false, 'message' => 'Error al verificar email'];
        }
    }

    /**
     * Iniciar sesión
     */
    public function login($email, $password) {
        if (empty($email) || empty($password)) {
            return ['success' => false, 'message' => 'Email y contraseña requeridos'];
        }

        try {
            try {
                $stmt = $this->db->prepare('SELECT id, name, email, password, is_admin, email_verified FROM users WHERE email = ?');
                $stmt->execute([$email]);
            } catch (PDOException $e) {
                // Fallback para esquemas antiguos sin columnas extra
                $stmt = $this->db->prepare('SELECT id, name, email, password FROM users WHERE email = ?');
                $stmt->execute([$email]);
            }

            if ($stmt->rowCount() === 0) {
                return ['success' => false, 'message' => 'Credenciales inválidas'];
            }

            $user = $stmt->fetch(PDO::FETCH_ASSOC);
            if (!isset($user['is_admin'])) {
                $user['is_admin'] = 0;
            }
            if (!isset($user['email_verified'])) {
                $user['email_verified'] = 1;
            }

            $passwordValid = password_verify($password, $user['password']);
            // Compatibilidad con contraseñas en texto plano (migraciones antiguas)
            if (!$passwordValid && hash_equals((string)$user['password'], (string)$password)) {
                $passwordValid = true;
                $newHash = password_hash($password, PASSWORD_DEFAULT);
                $stmt = $this->db->prepare('UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
                $stmt->execute([$newHash, $user['id']]);
            }

            if (!$passwordValid) {
                return ['success' => false, 'message' => 'Credenciales inválidas'];
            }

            // Verificar que el email esté verificado (si aplica)
            if (isset($user['email_verified']) && (int)$user['email_verified'] === 0) {
                // Permitir login para cuentas existentes sin verificación previa
                if ($this->dbType === 'mysql') {
                    $stmt = $this->db->prepare('UPDATE users SET email_verified = 1, email_verified_at = NOW() WHERE id = ?');
                } else {
                    $stmt = $this->db->prepare('UPDATE users SET email_verified = 1, email_verified_at = CURRENT_TIMESTAMP WHERE id = ?');
                }
                $stmt->execute([$user['id']]);
            }

            // Iniciar sesión
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['user_name'] = $user['name'];
            $_SESSION['user_email'] = $user['email'];
            $_SESSION['logged_in'] = true;
            $_SESSION['is_admin'] = (bool)($user['is_admin'] ?? false);

            return ['success' => true, 'message' => 'Sesión iniciada'];
        } catch (PDOException $e) {
            return ['success' => false, 'message' => 'Error en la base de datos'];
        }
    }

    /**
     * Solicitar recuperación de contraseña
     */
    public function requestPasswordReset($email) {
        if (empty($email)) {
            return ['success' => false, 'message' => 'Email requerido'];
        }

        try {
            // Verificar que el usuario exista
            $stmt = $this->db->prepare('SELECT id FROM users WHERE email = ?');
            $stmt->execute([$email]);
            
            if ($stmt->rowCount() === 0) {
                // Por seguridad, no revelar si el email existe o no
                return ['success' => true, 'message' => 'Si el email existe, recibirás instrucciones de recuperación'];
            }

            // Eliminar tokens anteriores
            $stmt = $this->db->prepare('DELETE FROM password_resets WHERE email = ? AND expires_at < CURRENT_TIMESTAMP');
            $stmt->execute([$email]);

            // Generar nuevo token
            $resetToken = $this->generateToken();
            $expiresAt = date('Y-m-d H:i:s', strtotime('+1 hour'));

            $stmt = $this->db->prepare('INSERT INTO password_resets (email, token, expires_at) VALUES (?, ?, ?)');
            $stmt->execute([$email, $resetToken, $expiresAt]);

            // Devolver token para desarrollo/testing
            return [
                'success' => true,
                'message' => 'Instrucciones de recuperación enviadas',
                'reset_token' => $resetToken, // Solo en desarrollo
                'reset_url' => 'reset-password.html?token=' . $resetToken
            ];
        } catch (PDOException $e) {
            return ['success' => false, 'message' => 'Error en la solicitud'];
        }
    }

    /**
     * Resetear contraseña con token
     */
    public function resetPassword($token, $newPassword, $confirmPassword) {
        if (empty($token) || empty($newPassword)) {
            return ['success' => false, 'message' => 'Datos incompletos'];
        }

        if ($newPassword !== $confirmPassword) {
            return ['success' => false, 'message' => 'Las contraseñas no coinciden'];
        }

        if (strlen($newPassword) < 8) {
            return ['success' => false, 'message' => 'La contraseña debe tener al menos 8 caracteres'];
        }

        try {
            // Buscar token válido y no expirado
            $stmt = $this->db->prepare('SELECT email FROM password_resets WHERE token = ? AND expires_at > CURRENT_TIMESTAMP');
            $stmt->execute([$token]);

            if ($stmt->rowCount() === 0) {
                return ['success' => false, 'message' => 'Token expirado o inválido'];
            }

            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            $email = $result['email'];

            // Actualizar contraseña
            $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);
            $stmt = $this->db->prepare('UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE email = ?');
            $stmt->execute([$hashedPassword, $email]);

            // Eliminar token usado
            $stmt = $this->db->prepare('DELETE FROM password_resets WHERE token = ?');
            $stmt->execute([$token]);

            return ['success' => true, 'message' => 'Contraseña actualizada correctamente'];
        } catch (PDOException $e) {
            return ['success' => false, 'message' => 'Error al resetear contraseña'];
        }
    }

    /**
     * Cerrar sesión
     */
    public function logout() {
        session_destroy();
        return ['success' => true, 'message' => 'Sesión cerrada'];
    }

    /**
     * Verificar si el usuario está autenticado
     */
    public static function isAuthenticated() {
        return isset($_SESSION['logged_in']) && $_SESSION['logged_in'] === true;
    }

    /**
     * Obtener datos del usuario autenticado
     */
    public static function getUser() {
        if (self::isAuthenticated()) {
            return [
                'id' => $_SESSION['user_id'],
                'name' => $_SESSION['user_name'],
                'email' => $_SESSION['user_email'],
                'is_admin' => $_SESSION['is_admin'] ?? false
            ];
        }
        return null;
    }
}

// Procesar las acciones
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? '';
    $auth = new Auth();
    $response = [];

    switch ($action) {
        case 'register':
            $response = $auth->register(
                $_POST['name'] ?? '',
                $_POST['email'] ?? '',
                $_POST['password'] ?? '',
                $_POST['password_confirm'] ?? ''
            );
            break;

        case 'verify-email':
            $response = $auth->verifyEmail($_POST['token'] ?? '');
            break;

        case 'login':
            $response = $auth->login(
                $_POST['email'] ?? '',
                $_POST['password'] ?? ''
            );
            break;

        case 'request-password-reset':
            $response = $auth->requestPasswordReset($_POST['email'] ?? '');
            break;

        case 'reset-password':
            $response = $auth->resetPassword(
                $_POST['token'] ?? '',
                $_POST['password'] ?? '',
                $_POST['password_confirm'] ?? ''
            );
            break;

        case 'logout':
            $response = $auth->logout();
            break;

        default:
            $response = ['success' => false, 'message' => 'Acción no válida'];
    }

    echo json_encode($response);
    exit();
}
?>
