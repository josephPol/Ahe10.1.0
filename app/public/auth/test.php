<?php
// Test de conexión simple
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json; charset=utf-8');

echo json_encode([
    'success' => true,
    'message' => 'Servidor funcionando correctamente',
    'server_ip' => $_SERVER['SERVER_ADDR'] ?? 'unknown',
    'client_ip' => $_SERVER['REMOTE_ADDR'] ?? 'unknown',
    'method' => $_SERVER['REQUEST_METHOD'] ?? 'unknown'
]);
