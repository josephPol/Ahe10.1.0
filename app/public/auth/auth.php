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

class Auth {
    private $db;

    public function __construct() {
        // Conectar a la base de datos
        try {
            $this->db = new PDO(
                'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8',
                DB_USER,
                DB_PASS,
                [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
            );
        } catch (PDOException $e) {
            die('Error de conexión: ' . $e->getMessage());
        }
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
            $stmt = $this->db->prepare('INSERT INTO users (name, email, password, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())');
            $stmt->execute([$name, $email, $hashedPassword]);
            
            $userId = $this->db->lastInsertId();
            
            // Iniciar sesión automáticamente
            $_SESSION['user_id'] = $userId;
            $_SESSION['user_name'] = $name;
            $_SESSION['user_email'] = $email;
            $_SESSION['logged_in'] = true;

            return ['success' => true, 'message' => 'Registro exitoso'];
        } catch (PDOException $e) {
            return ['success' => false, 'message' => 'Error al registrar: ' . $e->getMessage()];
        }
    }

    /**
     * Iniciar sesión
     */
    public function login($email, $password) {
        if (empty($email) || empty($password)) {
            return ['success' => false, 'message' => 'Email y contraseña requeridos'];
        }

        $stmt = $this->db->prepare('SELECT id, name, email, password FROM users WHERE email = ?');
        $stmt->execute([$email]);

        if ($stmt->rowCount() === 0) {
            return ['success' => false, 'message' => 'Credenciales inválidas'];
        }

        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!password_verify($password, $user['password'])) {
            return ['success' => false, 'message' => 'Credenciales inválidas'];
        }

        // Iniciar sesión
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['user_name'] = $user['name'];
        $_SESSION['user_email'] = $user['email'];
        $_SESSION['logged_in'] = true;

        return ['success' => true, 'message' => 'Sesión iniciada'];
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
                'email' => $_SESSION['user_email']
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
            
            if ($response['success']) {
                // Enviar correo de confirmación
                require_once __DIR__ . '/mailer.php';
                $mailer = new Mailer();
                $mailer->sendConfirmationEmail($_SESSION['user_email'], $_SESSION['user_name']);
            }
            break;

        case 'login':
            $response = $auth->login(
                $_POST['email'] ?? '',
                $_POST['password'] ?? ''
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
