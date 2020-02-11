include .env

.PHONY: up update build dsbin down start stop prune ps bash logs

default: up

up:
	@echo "Starting up containers for $(PROJECT_NAME)..."
	@docker-compose -f docker/docker-compose.yml -f docker/docker-compose-rest.yml up -d

update:
	@echo "Cleaning containers code, including 'node_modules' libraries, .css files, etc. Then install dependencies again..."
	docker-compose -f docker/docker-compose.yml run --workdir=/app --rm dspace-angular sh -c "yarn run clean && yarn install --force && yarn run build"

build:
	@echo "Building image from Dockerfile..."
	@docker-compose -f docker/docker-compose.yml -f docker/docker-compose-rest.yml build

dsbin:
	@echo "[HELP!] Define \"COMMAND\" variable if wants to pass specifics command to 'bin/dspace' DSpace's CLI... In example 'make COMMAND=\"dsprop -p dspace.dir\" dsbin'"...
	@echo "Running \"bin/dspace $(COMMAND)\"..."; docker exec -it dspace_$(PROJECT_NAME) $(DSPACE_PATH)/bin/dspace $(COMMAND); echo "Exiting..."

down: stop

start: up

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
	@docker-compose -f docker/docker-compose.yml -f docker/docker-compose-rest.yml logs --follow --tail=100 $(filter-out $@,$(MAKECMDGOALS))

# https://stackoverflow.com/a/6273809/1826109
%:
	@:
