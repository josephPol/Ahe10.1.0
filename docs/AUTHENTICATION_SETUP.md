# Sistema de Autenticación AJE10

## Descripción
Sistema de autenticación simple basado en PHP puro (sin Blade) que permite:
- Registro de nuevos usuarios
- Login de usuarios
- Mostrar el nombre del usuario en la barra de navegación
- Enviar correo de confirmación de registro
- Logout

## Estructura de archivos

```
app/public/
├── auth/
│   ├── auth.php          # Controlador de autenticación (POST)
│   ├── session.php       # Verificador de sesión (GET)
│   ├── auth.js           # Script para actualizar UI
│   └── mailer.php        # Envío de correos
├── config/
│   └── database.php      # Configuración de BD
├── html/
│   ├── login.html        # Formulario de login
│   ├── registro.html     # Formulario de registro
│   ├── inicio.html       # Página principal
│   ├── jugar.html        # Página de juego
│   ├── learn.html        # Página de aprendizaje
│   └── contact.html      # Página de contacto
```

## Configuración

### 1. Base de datos
Editar `app/public/config/database.php` con tus datos:
```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'aje10');
define('DB_USER', 'root');
define('DB_PASS', '');
```

### 2. Configuración de correo
La función de envío de correos está en `app/public/auth/mailer.php`. Por defecto usa `mail()` de PHP.

Para que funcione correctamente, asegúrate de:
- Tener un servidor SMTP configurado en php.ini
- O usar una clase SMTP como PHPMailer

## Cómo funciona

### Flujo de Registro
1. Usuario completa formulario en `registro.html`
2. JavaScript hace POST a `auth/auth.php` con `action=register`
3. PHP valida datos y crea usuario en BD
4. Se inicia sesión automáticamente
5. Se envía correo de confirmación
6. Se redirige a `inicio.html`

### Flujo de Login
1. Usuario completa formulario en `login.html`
2. JavaScript hace POST a `auth/auth.php` con `action=login`
3. PHP verifica credenciales en BD
4. Si son válidas, inicia sesión
5. Se redirige a `inicio.html`

### Actualización de UI
Todos los archivos HTML que tengan `<div class="topRight">` incluyen `auth.js` que:
1. Hace GET a `auth/session.php` al cargar la página
2. Si hay sesión activa, reemplaza botones de "Acceder" y "Registro" por el nombre del usuario y botón "Salir"
3. El cambio es automático y se actualiza cada 30 segundos

### Flujo de Logout
1. Usuario hace click en botón "Salir"
2. JavaScript hace POST a `auth/auth.php` con `action=logout`
3. Se destruye la sesión
4. Se redirige a `inicio.html`
5. Los botones vuelven a aparecer

## Base de datos requerida

```sql
CREATE TABLE users (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## Variables de sesión disponibles

Después de login/registro, las siguientes variables están disponibles en `$_SESSION`:
- `$_SESSION['logged_in']` - true si está autenticado
- `$_SESSION['user_id']` - ID del usuario
- `$_SESSION['user_name']` - Nombre del usuario
- `$_SESSION['user_email']` - Email del usuario

## Seguridad

- Las contraseñas se hashean con `password_hash()` (bcrypt)
- Las consultas a BD usan prepared statements (PDO)
- Las sesiones se usan para mantener el estado autenticado

## Personalización de estilos

Los botones autogenerados en `auth.js` usan estas clases CSS:
- `.user-menu` - Contenedor del usuario
- `.user-name` - Nombre del usuario
- `.btn-danger` - Botón de logout (rojo)

Puedes personalizar los estilos en tu CSS.

## Troubleshooting

### Error: "No se puede leer el archivo"
Asegúrate de que la ruta en `require_once` es correcta.

### Las contraseñas no coinciden en login
Verifica que `password_verify()` se está ejecutando correctamente en PHP.

### El correo no se envía
1. Configura un servidor SMTP en php.ini
2. O reemplaza `mail()` con PHPMailer o similar

### Los botones no desaparecen después de login
- Abre la consola del navegador (F12) y verifica que `auth.js` se carga sin errores
- Verifica que `auth/session.php` devuelve JSON válido

## Próximos pasos

- Implementar recuperación de contraseña
- Agregar verificación de email
- Agregar 2FA (autenticación de dos factores)
- Sistema de roles y permisos
