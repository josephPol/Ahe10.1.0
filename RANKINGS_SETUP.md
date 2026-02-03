# Sistema de Rankings - Instrucciones de Configuración

## Pasos para activar el sistema de rankings:

### 1. Ejecutar las migraciones
Desde el directorio del proyecto, ejecuta:
```bash
php artisan migrate
```

Esto creará las columnas necesarias en la tabla `users`:
- `wins` (victorias)
- `losses` (derrotas)
- `draws` (empates)
- `total_games` (total de partidas)
- `rating` (puntuación ELO)

### 2. Poblar la base de datos con usuarios de ejemplo
```bash
php artisan db:seed --class=UserSeeder
```

Este comando creará 10 usuarios con estadísticas de ejemplo para mostrar en el ranking.

### 3. Verificar la configuración

La página de inicio (`/inicio`) ahora incluye una sección de **TOP JUGADORES** al final que muestra:
- Posición en el ranking (con medallas 🥇🥈🥉 para los top 3)
- Avatar del jugador
- Nombre del jugador
- Victorias
- Partidas totales
- Porcentaje de victoria
- Rating ELO

### 4. Endpoint API

El ranking está disponible en: `GET /api/rankings`

Devuelve un JSON con los top 10 jugadores ordenados por victorias y rating.

### 5. Integración con el juego de ajedrez

Para actualizar las estadísticas cuando un jugador gana una partida, puedes usar:

```php
$user = Auth::user();
$user->wins++;
$user->total_games++;
$user->rating += 10; // Ajustar según sistema ELO
$user->save();
```

### Archivos creados/modificados:

1. **Migración**: `database/migrations/2026_02_03_000001_add_game_stats_to_users_table.php`
2. **Controlador**: `Http/Controllers/RankingController.php`
3. **Seeder**: `database/seeders/UserSeeder.php`
4. **Vista**: `app/public/html/inicio.html` (sección rankings agregada)
5. **JavaScript**: `app/public/js/rankings.js`
6. **CSS**: `app/public/css/inicio.css` (estilos de rankings agregados)
7. **Ruta**: `routes/web.php` (endpoint `/api/rankings` agregado)

### Diseño Responsive

El ranking se adapta a diferentes tamaños de pantalla:
- **Desktop**: Muestra todas las columnas
- **Tablet** (< 900px): Oculta % Victoria y Rating
- **Móvil** (< 600px): Solo muestra posición, nombre y victorias

### Personalización

Puedes modificar:
- **Número de jugadores mostrados**: Cambiar `->take(10)` en `RankingController.php`
- **Criterio de ordenamiento**: Modificar `orderBy()` en el controlador
- **Estilos**: Editar `app/public/css/inicio.css`
