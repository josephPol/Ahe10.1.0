# Makefile: comandos útiles para desarrollo con docker-compose

.PHONY: up down build restart logs ps migrate artisan shell composer

up:
	docker-compose up -d --build

down:
	docker-compose down

restart: down up

ps:
	docker-compose ps

logs:
	docker-compose logs -f app

migrate:
	docker-compose exec app php artisan migrate

artisan:
	docker-compose exec app php artisan $(cmd)

shell:
	docker-compose exec app bash

composer:
	docker-compose exec app composer $(cmd)
