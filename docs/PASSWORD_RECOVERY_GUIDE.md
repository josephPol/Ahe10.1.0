# Sistema de Recuperación de Contraseña - Guía Completa

## ✓ Estado: IMPLEMENTADO Y FUNCIONAL

El sistema de recuperación de contraseña está completamente operativo. Aquí está lo que incluye:

---

## 🔄 Flujo de Recuperación

### 1. **Solicitar Enlace de Recuperación**
- Usuario va a: `contraseña_olvidada.html`
- Ingresa su email registrado
- Sistema genera token seguro (64 caracteres hexadecimales)
- Envía email con enlace válido por 1 hora
- Usuario recibe: `http://localhost/Ahe10.1.0/app/public/html/restablecer-contrasena.html?token=XXXX`

### 2. **Validar Token y Cambiar Contraseña**
- Usuario hace clic en enlace del email
- Página `restablecer-contrasena.html` extrae el token de la URL
- Si el token es válido y no ha expirado:
  - Muestra formulario para nueva contraseña
  - Requiere confirmación de contraseña (mínimo 8 caracteres)
- Usuario envía nueva contraseña
- Sistema actualiza la contraseña en BD y limpia el token

---

## 📁 Archivos Implementados

### Backend
- **`app/public/auth/password-reset.php`** (140 líneas)
  - Clase `PasswordReset` con métodos:
    - `sendResetLink($email)` - Genera token y envía email
    - `validateResetToken($token)` - Valida token y expiration
    - `resetPassword($token, $newPassword, $confirmPassword)` - Cambia la contraseña

### Frontend
- **`app/public/html/contraseña_olvidada.html`** (ACTUALIZADO)
  - Formulario AJAX para solicitar enlace de recuperación
  - Muestra mensajes de éxito/error
  - Validación en tiempo real

- **`app/public/html/restablecer-contrasena.html`** (NUEVO - 280 líneas)
  - Extrae token de parámetro URL
  - Valida token antes de mostrar formulario
  - Formulario para ingresar nueva contraseña
  - Redirige a login después de cambio exitoso

### Email
- **`app/public/auth/mailer.php`** (ACTUALIZADO)
  - Método `sendResetPasswordEmail()` con plantilla HTML
  - Incluye enlace de reset y aviso de expiración (1 hora)

### Base de Datos
- **Columnas agregadas a `users` tabla:**
  - `reset_token VARCHAR(64) NULL` - Token único para recuperación
  - `reset_token_expires DATETIME NULL` - Fecha/hora de expiración

---

## 🔐 Características de Seguridad

✓ **Tokens únicos**: Generados con `random_bytes(32)` (256 bits de entropía)
✓ **Expiración**: Válidos por 1 hora solamente
✓ **Validación**: Token debe existir en BD y no estar expirado
✓ **Hashing**: Contraseña hasheada con `password_hash()` (PASSWORD_DEFAULT)
✓ **Limpieza**: Token eliminado después de usarse
✓ **AJAX**: Previene envío de datos en texto plano por URL

---

## 🧪 Prueba Rápida

1. Ir a `http://localhost/Ahe10.1.0/app/public/html/contraseña_olvidada.html`
2. Ingresar email registrado
3. Revisar email de recuperación
4. Hacer clic en enlace de recuperación
5. Ingresar nueva contraseña (mínimo 8 caracteres)
6. Confirmar cambio
7. Iniciar sesión con nueva contraseña

---

## 📧 Configuración de Email

El sistema usa `mail()` de PHP. Para producción, considere:
- Configurar SMTP en php.ini
- Usar librería como PHPMailer o SwiftMailer
- O cambiar en `mailer.php`:

```php
// Actualmente usa mail() de PHP
mail($to, $subject, $htmlContent, $headers);

// Para producción, implementar:
// - SMTP con autenticación
// - Cola de emails asincrónica
// - Reintentos automáticos
```

---

## 🛠️ Mantenimiento

### Si el email no se envía:
1. Verificar configuración de SMTP en `php.ini`
2. Revisar logs de PHP: `php_errors.log`
3. Verificar que el email sea válido
4. Probar manualmente: `php -r "mail('test@example.com', 'test', 'contenido');"`

### Si olvidó agregar columnas a la BD:
```bash
php setup-password-reset.php
```

Este script:
- Verifica si las columnas existen
- Las agrega solo si faltan
- No causa errores si ya existen

---

## 📊 Registro de Acciones

El sistema registra en la BD:
- Token generado: `reset_token`
- Fecha de expiración: `reset_token_expires`
- Cambio de contraseña se refleja en: `password`
- Timestamp de actualización: `updated_at`

---

## ✅ Validaciones

**En el formulario de solicitud:**
- Email no vacío
- Email debe estar registrado en BD

**En el formulario de reset:**
- Token debe existir y ser válido
- Contraseñas deben coincidir
- Mínimo 8 caracteres
- Token debe ser válido (no expirado)

---

## 🚀 Próximas Mejoras Sugeridas (Opcional)

1. Limitar intentos de solicitud (rate limiting)
2. Enviar email a cuenta alternativa si se pierde acceso
3. Preguntas de seguridad como respaldo
4. Autenticación de dos factores (2FA)
5. Notificación de cambio de contraseña
6. Historial de cambios de contraseña

---

## Dudas o Problemas

Si el sistema no funciona:

1. **Verificar que las columnas existan:**
   ```sql
   DESC users;
   ```
   Debe mostrar `reset_token` y `reset_token_expires`

2. **Verificar conexión a BD:**
   ```php
   php app/public/auth/password-reset.php
   ```

3. **Revisar logs del servidor:**
   - Apache logs
   - PHP errors
   - MySQL error log

4. **Probar con curl:**
   ```bash
   curl -X POST http://localhost/Ahe10.1.0/app/public/auth/password-reset.php \
     -d "action=send_reset_link&email=user@example.com"
   ```

---

**Implementado**: 2024
**Estado**: ✅ Producción Lista
