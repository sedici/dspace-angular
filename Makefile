include .env

.PHONY: up up-complete update down stop prune ps bash logs

default: up

up:
	@echo "Starting up containers for $(PROJECT_NAME)..."
	@docker-compose -f docker/docker-compose.yml -f docker/docker-compose-rest.yml up -d

up-complete:
	@echo "Starting up containers for ${PROJECT_NAME}, including a functional local REST ENDPOINT..."
	@docker-compose -f docker/docker-compose-rest.yml -f docker/docker-compose-rest.yml up -d

update:
	@echo "Cleaning containers code, including 'node_modules' libraries, .css files, etc. Then install dependencies again..."
	docker-compose -f docker/docker-compose.yml run --workdir=/app --rm dspace-angular sh -c "yarn run clean && yarn install --force && yarn run build"

down: stop

stop:
	@echo "Stopping containers for $(PROJECT_NAME)..."
	@docker-compose -f docker/docker-compose.yml -f docker/docker-compose-rest.yml stop

prune:
	@echo "Removing containers for $(PROJECT_NAME)..."
	@docker-compose -f docker/docker-compose.yml -f docker/docker-compose-rest.yml down -v

ps:
	@docker ps --filter name='$(PROJECT_NAME)*'

bash:
	@docker exec -i -t 'dspace-angular_${PROJECT_NAME}' /bin/sh

logs:
	@docker-compose -f docker/docker-compose.yml -f docker/docker-compose-rest.yml logs --follow $(filter-out $@,$(MAKECMDGOALS))

# https://stackoverflow.com/a/6273809/1826109
%:
	@:
