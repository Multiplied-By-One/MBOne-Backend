all: down clean-db build up

clean-db:
	npm run db:clean
	rm data/.database.built || true

build:
	docker-compose build --force mbo_backend

up: 
	docker-compose up

down:
	docker-compose down

import-db:
	npm run typeorm schema:sync