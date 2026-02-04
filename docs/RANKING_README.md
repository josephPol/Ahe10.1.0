# 🏆 Sistema de Rankings - AJE10

## ¿Qué incluye?

He implementado un sistema completo de rankings en la página de inicio que muestra:

- **Top 10 jugadores** ordenados por victorias
- **Medallas** para los 3 primeros (🥇🥈🥉)
- **Avatar** de cada jugador
- **Estadísticas**: Victorias, Partidas totales, % de victoria, Rating ELO
- **Diseño pixel art** que combina con el resto del sitio
- **Responsive**: Se adapta a móvil, tablet y desktop

## 🚀 Cómo activarlo

### Opción 1: Script automático (más fácil)
```bash
cd /home/vboxuser/Desktop/ahe10/Ahe10.1.0
./setup-rankings.sh
```

### Opción 2: Paso a paso
```bash
# 1. Ejecutar migraciones (crea las columnas en la BD)
php artisan migrate

# 2. Crear usuarios de ejemplo
php artisan db:seed --class=UserSeeder
```

## 📁 Archivos creados

### Backend (Laravel)
- `database/migrations/2026_02_03_000001_add_game_stats_to_users_table.php` - Agrega columnas de estadísticas
- `Http/Controllers/RankingController.php` - Controlador del ranking
- `database/seeders/UserSeeder.php` - Crea 10 usuarios de ejemplo
- `routes/web.php` - Ruta API `/api/rankings`
- `Models/User.php` - Actualizado con nuevos campos

### Frontend
- `app/public/html/inicio.html` - Sección de rankings agregada
- `app/public/js/rankings.js` - JavaScript para cargar datos
- `app/public/css/inicio.css` - Estilos del ranking

## 🎮 Usuarios de ejemplo creados

El seeder crea 10 jugadores famosos con estadísticas realistas:

1. Magnus Carlsen - 150 victorias, 2850 rating
2. Hikaru Nakamura - 145 victorias, 2790 rating
3. Fabiano Caruana - 130 victorias, 2780 rating
4. ... y 7 más

## 🔌 API

**Endpoint**: `GET /api/rankings`

**Respuesta**:
```json
{
  "success": true,
  "data": [
    {
      "name": "Magnus Carlsen",
      "wins": 150,
      "losses": 20,
      "draws": 30,
      "total_games": 200,
      "rating": 2850,
      "win_rate": 75.0
    },
    ...
  ]
}
```

## 📱 Vista responsive

- **Desktop (>900px)**: Todas las columnas visibles
- **Tablet (600-900px)**: Oculta % victoria y rating
- **Móvil (<600px)**: Solo posición, nombre y victorias

## 🎨 Diseño

El ranking mantiene el estilo pixel art del sitio:
- Bordes gruesos con efecto 3D
- Sombras y efectos de profundidad
- Hover con animación
- Colores consistentes con la paleta del sitio
- Modo oscuro compatible

## 🔄 Integración futura

Para actualizar estadísticas cuando alguien gana:

```php
use Illuminate\Support\Facades\Auth;

// Después de una victoria
$user = Auth::user();
$user->wins++;
$user->total_games++;
$user->rating += 10;
$user->save();
```

## ✨ Características adicionales

- **Carga dinámica**: Los datos se cargan desde la API sin recargar la página
- **Manejo de errores**: Muestra mensajes si no hay datos o hay error
- **Seguridad**: Escape de HTML para prevenir XSS
- **Performance**: Solo muestra top 10 para carga rápida

---

**¡Listo!** Una vez ejecutes el script o las migraciones, verás el ranking funcionando en http://localhost:8080/inicio 🎉
