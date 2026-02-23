# AJE10

AJE10 es una plataforma web de ajedrez orientada al aprendizaje y la practica.
Permite jugar partidas locales o contra IA, consultar rankings, gestionar
amistades y acceder a una biblioteca de jugadas con explicaciones. Incluye
registro, login, recuperacion de contrasena y confirmacion de cuenta por email.

## Funcionalidades principales

- Juego local y contra IA con controles y estados claros.
- Biblioteca de jugadas con fichas de detalle y apoyo visual.
- Rankings con clasificacion general.
- Sistema de amigos y solicitudes.
- Autenticacion completa con recuperacion y confirmacion por email.
- Panel de administracion para gestion de usuarios.

## Roles

- Usuario: acceso a juego, biblioteca, rankings, amigos y contacto.
- Administrador: acceso adicional a gestion de usuarios y acciones de control.

## Tecnologias

- Backend: PHP 8.2, Laravel 12
- Frontend: HTML5, CSS3, JavaScript ES6
- Base de datos: MySQL 8.0
- Build/infra: Vite, Docker, Docker Compose
- Librerias: Chess.js, Chessboard.js

## Instalacion (resumen)

- Docker: seguir la guia en [INSTALACION.md](INSTALACION.md).
- Manual: usar Composer y Vite segun la misma guia.

## Estructura de documentacion

- [INSTALACION.md](INSTALACION.md): instalacion y configuracion.
- [ARQUITECTURA.md](ARQUITECTURA.md): arquitectura y modelo de datos.
- [SEGURIDAD.md](SEGURIDAD.md): medidas de seguridad.
- [MANUAL_USUARIO.md](MANUAL_USUARIO.md): uso de la plataforma.
- [RANKINGS_SETUP.md](RANKINGS_SETUP.md) y [RANKING_README.md](RANKING_README.md): sistema de rankings.
- [LIMPIEZA_PROYECTO.md](LIMPIEZA_PROYECTO.md): registro de limpieza.

## Escalabilidad

La aplicacion se apoya en MVC y en una separacion clara entre backend, frontend
y datos. La modularidad de rutas, controladores y vistas permite anadir modos
de juego, nuevas jugadas o paneles sin rehacer la base. La base de datos y el
despliegue con Docker facilitan el crecimiento y el mantenimiento.
