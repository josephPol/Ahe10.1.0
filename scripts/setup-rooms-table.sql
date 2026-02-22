-- Script para crear tabla de salas de juego en AJE10
-- Ejecuta este script en phpMyAdmin o desde la línea de comandos de MySQL

CREATE TABLE IF NOT EXISTS game_rooms (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT NULL,
  modo VARCHAR(50) NOT NULL DEFAULT 'local',
  max_players TINYINT UNSIGNED NOT NULL DEFAULT 2,
  status VARCHAR(50) NOT NULL DEFAULT 'activo',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Verificar estructura de la tabla:
-- DESCRIBE game_rooms;

-- Ver salas registradas:
-- SELECT id, nombre, modo, max_players, status FROM game_rooms;
