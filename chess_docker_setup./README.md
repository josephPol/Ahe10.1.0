Proyecto Laravel con Docker (chess_docker_setup)

Resumen rápido:
- El código Laravel está dentro de `app/`.
- `docker-compose.yml` monta `./app` en `/var/www/html` dentro del contenedor `app`.
- Apache sirve desde `/var/www/html/public`.

Comandos útiles:

Levantar (build incluido):

```
make up
```

Detener:

```
make down
```

Ver logs:

```
make logs
```

Ejecutar migraciones:

```
make migrate
```

Entrar al shell del contenedor app:

```
make shell
```

Notas:
- No comitees `app/.env`; usa `app/.env.example` como plantilla.
- Si quieres usar sesiones en base de datos, deja `SESSION_DRIVER=database` y crea la tabla con migraciones; por simplicidad `SESSION_DRIVER=file` funciona bien para desarrollo local.
