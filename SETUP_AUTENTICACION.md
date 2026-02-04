# 🔐 Guía de Configuración - Sistema de Autenticación AJE10

## PASO 1: Preparar la Base de Datos

### Opción A: Usando phpMyAdmin
1. Abre phpMyAdmin en `http://localhost/phpmyadmin`
2. Selecciona la base de datos `aje10`
3. Ve a la pestaña "SQL"
4. Copia el contenido de `setup-users-table.sql`
5. Pega en el editor SQL de phpMyAdmin
6. Haz click en "Ejecutar"

### Opción B: Desde línea de comandos
```bash
mysql -u root -p aje10 < setup-users-table.sql
```

### Verificar que la tabla existe
En phpMyAdmin, deberías ver una tabla llamada `users` con estos campos:
- `id` (BIGINT, clave primaria, auto-increment)
- `name` (VARCHAR 255)
- `email` (VARCHAR 255, único)
- `password` (VARCHAR 255)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

## PASO 2: Configurar Base de Datos en PHP

Edita el archivo `app/public/config/database.php`:

```php
<?php
define('DB_HOST', 'localhost');      // Tu servidor MySQL
define('DB_NAME', 'aje10');          // Nombre de tu BD
define('DB_USER', 'root');           // Usuario de MySQL
define('DB_PASS', '');               // Contraseña de MySQL
```

## PASO 3: Verificar Instalación

### Prueba automática
1. Accede a `http://localhost/Ahe10.1.0/auth-test.php`
2. Verifica que todos los tests pasen (✓)
3. Si hay errores (✗), revisa la configuración

## PASO 4: Probar el Sistema

### Registrar un usuario
1. Ve a `http://localhost/Ahe10.1.0/app/public/html/registro.html`
2. Completa el formulario:
   - Nombre: Tu nombre
   - Email: tu@email.com
   - Contraseña: (mínimo 8 caracteres)
   - Repetir contraseña: (debe coincidir)
3. Acepta términos y haz click en "Crear cuenta"
4. **Resultado esperado:**
   - ✓ Mensaje verde "Cuenta creada exitosamente"
   - ✓ Se envía un correo de confirmación
   - ✓ Redirige a inicio.html
   - ✓ El botón "Acceder" desaparece
   - ✓ Aparece tu nombre + botón "Salir"

### Iniciar sesión
1. Haz click en "Salir"
2. Ve a `http://localhost/Ahe10.1.0/app/public/html/login.html`
3. Completa con tus credenciales
4. Haz click en "Entrar"
5. **Resultado esperado:**
   - ✓ Mensaje verde "Iniciando sesión..."
   - ✓ Redirige a inicio.html
   - ✓ Aparece tu nombre + botón "Salir"

### Cerrar sesión
1. Haz click en el botón "Salir"
2. **Resultado esperado:**
   - ✓ Se destruye la sesión
   - ✓ Redirige a inicio.html
   - ✓ Los botones "Acceder" y "Registro" reaparecen

## PASO 5: Configurar Envío de Correos (Opcional)

Por defecto, el sistema usa la función `mail()` de PHP. Para que funcione:

### En Windows (XAMPP):
1. Abre `php.ini` (usualmente en `C:\xampp\php\php.ini`)
2. Busca la sección `[mail function]`
3. Configura tu servidor SMTP:
   ```ini
   [mail function]
   SMTP = smtp.gmail.com
   smtp_port = 587
   sendmail_from = tu@email.com
   ```

### En Linux:
Usa Postfix o Sendmail (ya suele estar configurado).

### Alternativa: Usar PHPMailer
Para un control más avanzado, puedes reemplazar `mail()` con PHPMailer:

```php
// En mailer.php
require_once 'vendor/autoload.php';
use PHPMailer\PHPMailer\PHPMailer;

$mailer = new PHPMailer(true);
$mailer->isSMTP();
$mailer->Host = 'smtp.gmail.com';
$mailer->SMTPAuth = true;
// ... etc
```

## Estructura de Archivos Creados

```
app/public/
├── auth/
│   ├── auth.php              ← Controlador principal
│   ├── session.php           ← Verificador de sesión
│   ├── auth.js               ← Script de actualización UI
│   └── mailer.php            ← Envío de correos
├── config/
│   └── database.php          ← Configuración de BD
└── html/
    ├── login.html            ← Modificado
    ├── registro.html         ← Modificado
    ├── inicio.html           ← Modificado
    └── [otros HTML]          ← Modificados
```

## Seguridad - Notas Importantes

✓ **Implementado:**
- Contraseñas hasheadas con bcrypt (password_hash)
- Prepared statements en todas las consultas SQL
- Session HTTPS (configurable)
- Validación de input en servidor y cliente

⚠️ **Recomendaciones adicionales:**
- Usar HTTPS en producción (no HTTP)
- Implementar CSRF tokens en formularios
- Agregar rate limiting para prevenir fuerza bruta
- Implementar 2FA (autenticación de dos factores)
- Limpiar sesiones antiguas regularmente

## Troubleshooting

### "Error de conexión a BD"
- Verifica que MySQL está corriendo
- Verifica usuario, contraseña y nombre de BD en `database.php`
- Verifica que la base de datos existe en phpMyAdmin

### "Las contraseñas no coinciden"
- Asegúrate de que `password_verify()` funciona en PHP
- Verifica que el hash se guardó correctamente en BD
- Prueba la función de login con un usuario conocido

### "El correo no se envía"
- Verifica SMTP en `php.ini`
- Prueba con un script simple de mail()
- Revisa logs de error de PHP: `C:\xampp\apache\logs\error.log`

### "Los botones no desaparecen después de login"
- Abre consola (F12) y revisa errores en JavaScript
- Verifica que `session.php` devuelve JSON válido
- Verifica rutas de archivos (../../auth vs ../auth)

### "El logout no funciona"
- Verifica que sesiones están habilitadas en `php.ini`
- Prueba manualmente: borra cookies del navegador
- Verifica que `auth.php` recibe `action=logout`

## Contacto & Soporte

Para problemas o preguntas:
1. Revisa el archivo `AUTHENTICATION_SETUP.md`
2. Comprueba los logs de error de PHP
3. Verifica la consola del navegador (F12)

¡Que disfrutes AJE10! ♔
