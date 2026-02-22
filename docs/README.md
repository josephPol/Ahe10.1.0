# 📚 Documentación del Proyecto AJE10

Bienvenido a la documentación completa del proyecto **AJE10** - Plataforma de Ajedrez Online.

---

## 📖 Índice de Documentación

### Documentación Principal

1. **[README.md](../README.md)** - Introducción al proyecto, características y guía de inicio rápido
   - Características principales
   - Stack tecnológico
   - Instalación rápida
   - Uso básico
   - API endpoints

### Manuales Técnicos

2. **[INSTALACION.md](INSTALACION.md)** - Manual completo de instalación
   - Instalación con Docker (recomendado)
   - Instalación manual (sin Docker)
   - Configuración de entorno
   - Solución de problemas
   - Actualización y desinstalación

3. **[ARQUITECTURA.md](ARQUITECTURA.md)** - Documentación técnica de arquitectura
   - Diagrama de arquitectura
   - Patrón MVC
   - Modelo de datos (ER)
   - Tecnologías utilizadas
   - Patrones de diseño implementados
   - Flujo de datos
   - Decisiones de arquitectura

4. **[SEGURIDAD.md](SEGURIDAD.md)** - Documento de seguridad
   - Autenticación y autorización
   - Gestión de sesiones
   - Prevención de ataques (SQL Injection, XSS, CSRF)
   - Protección de datos
   - Recomendaciones para producción
   - Headers de seguridad

### Manuales de Usuario

5. **[MANUAL_USUARIO.md](MANUAL_USUARIO.md)** - Guía completa para usuarios
   - Registro e inicio de sesión
   - Navegación en la plataforma
   - Cómo jugar (local y vs IA)
   - Sistema de amigos
   - Rankings y estadísticas
   - Biblioteca de jugadas
   - Perfil de usuario
   - Preguntas frecuentes

### Documentación Específica

6. **[RANKINGS_SETUP.md](RANKINGS_SETUP.md)** - Configuración del sistema de rankings
   - Instrucciones de activación
   - Estructura de tablas
   - Sistema de rating ELO
   - Integración con el juego

7. **[RANKING_README.md](RANKING_README.md)** - Detalles del sistema de rankings
   - Características del sistema
   - API endpoints
   - Diseño responsive
   - Personalización

8. **[LIMPIEZA_PROYECTO.md](LIMPIEZA_PROYECTO.md)** - Registro de limpieza del proyecto
   - Archivos eliminados
   - Estructura optimizada
   - Funcionalidades removidas
   - Consolidación de código

---

## 🚀 Inicio Rápido

### Para Usuarios Nuevos
1. Lee el [README.md](../README.md) para una visión general
2. Sigue la [guía de instalación](INSTALACION.md) (con Docker)
3. Consulta el [manual de usuario](MANUAL_USUARIO.md) para usar la plataforma

### Para Desarrolladores
1. Lee [ARQUITECTURA.md](ARQUITECTURA.md) para entender el diseño
2. Revisa [SEGURIDAD.md](SEGURIDAD.md) antes de contribuir
3. Sigue las instrucciones en [INSTALACION.md](INSTALACION.md) para entorno de desarrollo

### Para Administradores
1. Completa la instalación siguiendo [INSTALACION.md](INSTALACION.md)
2. Configura los rankings con [RANKINGS_SETUP.md](RANKINGS_SETUP.md)
3. Revisa las recomendaciones de seguridad en [SEGURIDAD.md](SEGURIDAD.md)

---

## 📊 Información del Proyecto

### Tecnologías Principales
- **Backend**: PHP 8.2, Laravel 12
- **Frontend**: HTML5, CSS3, JavaScript ES6
- **Base de datos**: MySQL 8.0
- **Infraestructura**: Docker, Docker Compose
- **Librerías**: Chess.js, Chessboard.js

### Estado del Proyecto
- ✅ Sistema de autenticación completo
- ✅ Juego local y vs IA funcional
- ✅ Sistema de amigos implementado
- ✅ Rankings con rating ELO
- ✅ Biblioteca de jugadas
- ✅ Panel de administración
- 🔄 Sistema de partidas online en tiempo real (futuro)
- 🔄 Chat entre usuarios (futuro)

---

## 🤝 Contribuir

Este proyecto fue desarrollado como **Proyecto Integrado para DAW (Desarrollo de Aplicaciones Web) 2026**.

Si deseas contribuir:
1. Lee toda la documentación técnica
2. Revisa las guías de seguridad
3. Sigue los estándares de código establecidos
4. Documenta todos los cambios

---

## 📝 Estructura de la Documentación

```
docs/
├── README.md                 # Este archivo (índice)
├── INSTALACION.md           # Guía de instalación completa
├── ARQUITECTURA.md          # Documentación técnica
├── SEGURIDAD.md             # Documento de seguridad
├── MANUAL_USUARIO.md        # Manual para usuarios finales
├── RANKINGS_SETUP.md        # Configuración de rankings
├── RANKING_README.md        # Detalles del sistema de rankings
└── LIMPIEZA_PROYECTO.md     # Log de refactorización
```

---

## ⚠️ Notas Importantes

### Para Desarrollo
- `APP_DEBUG=true` en `.env`
- Usa Mailpit para probar emails (http://localhost:8025)
- Laravel Telescope habilitado para debugging

### Para Producción
- **CRÍTICO**: `APP_DEBUG=false` en `.env`
- Habilita HTTPS con certificado válido
- Configura backups automáticos
- Implementa rate limiting
- Revisa todas las recomendaciones en [SEGURIDAD.md](SEGURIDAD.md)

---

## 📞 Soporte

- **Documentación**: Revisa los archivos en esta carpeta
- **Issues**: Reporta bugs en el repositorio
- **Email**: soporte@aje10.com *(ejemplo)*
- **Vulnerabilidades**: Consulta [SEGURIDAD.md](SEGURIDAD.md#reporte-de-vulnerabilidades)

---

## 📜 Licencia

Este proyecto está bajo la licencia MIT. Ver archivo LICENSE para más detalles.

---

## 🎯 Roadmap

### Versión 2.0 (Futuro)
- [ ] Sistema de partidas online en tiempo real (WebSockets)
- [ ] Chat entre usuarios
- [ ] Notificaciones push
- [ ] Análisis de partidas con Stockfish
- [ ] Torneos y competiciones
- [ ] Aplicación móvil

### Versión 1.5 (Próximamente)
- [ ] Recuperación de contraseña por email
- [ ] Tests automatizados (PHPUnit)
- [ ] CI/CD con GitHub Actions
- [ ] Mejoras de performance (Redis cache)

### Versión 1.0 (Actual) ✅
- [x] Sistema de autenticación
- [x] Juego local y vs IA
- [x] Sistema de amigos
- [x] Rankings con ELO
- [x] Biblioteca de jugadas
- [x] Panel de administración

---

**Última actualización**: Febrero 2026  
**Proyecto**: AJE10 - Plataforma de Ajedrez Online  
**Autor**: Proyecto Integrado DAW 2026
