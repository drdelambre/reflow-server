DOCKER_COMPOSE := docker-compose -f fig.yml

start:
	$(DOCKER_COMPOSE) up -d $(NODE)

stop:
	$(DOCKER_COMPOSE) kill $(NODE)
	$(DOCKER_COMPOSE) rm -f $(NODE)

restart:
	$(MAKE) stop NODE=$(NODE)
	$(MAKE) start NODE=$(NODE)

logs:
	$(DOCKER_COMPOSE) logs -f $(NODE)

build:
	$(DOCKER_COMPOSE) build $(NODE)
