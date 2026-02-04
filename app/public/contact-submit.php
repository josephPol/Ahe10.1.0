<?php
header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/config/database.php';

function respond($success, $message, $extra = []) {
    echo json_encode(array_merge(['success' => $success, 'message' => $message], $extra));
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(false, 'Método no permitido. Use POST.');
}

$name = trim($_POST['name'] ?? '');
$email = trim($_POST['email'] ?? '');
$subject = trim($_POST['subject'] ?? '');
$message = trim($_POST['message'] ?? '');

if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    respond(false, 'Email inválido.');
}

if ($message === '') {
    respond(false, 'El mensaje es requerido.');
}

try {
    $db = new PDO(
        'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8',
        DB_USER,
        DB_PASS,
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );

    $stmt = $db->prepare('INSERT INTO contact_messages (name, email, subject, message, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())');
    $stmt->execute([
        $name !== '' ? $name : null,
        $email,
        $subject !== '' ? $subject : null,
        $message
    ]);

    respond(true, 'Mensaje enviado correctamente. Gracias.');
} catch (PDOException $e) {
    respond(false, 'No se pudo guardar el mensaje.');
}
