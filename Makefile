# Compose automatically looks for a file named .env 
# in the directory where the docker compose command is run.

export COMPOSE_BAKE=true

# Colors for pretty logs
GREEN = \033[0;32m
RESET = \033[0m

COMPOSE = docker compose -f srcs/docker-compose.yml

# --build eger dockerfile degistiyse, 
# docker-compose yeni versiyon var mi diye check etmeden, 
# eski image i kullaniyor.
# --build dockerfile da bir revizyon varsa yeniden image olusturuyor.
# -d detached mode, docker-compose terminali ele gecirmesin diye.
# sureki loglamaya devam ediyor.
all: down build list

down:
	@echo "$(GREEN)Stopping services...$(RESET)"
	@$(COMPOSE) down

clean:
	@echo "$(GREEN)Stopping services...$(RESET)"
	@$(COMPOSE) down -v --rmi all --remove-orphans

fclean: clean
	@echo "$(GREEN)Cleaning up...$(RESET)"
	@docker system prune -a --force
	@docker volume prune --force

prune:
	docker system prune -af

re: clean all

build:
	@echo "$(GREEN)Building containers...$(RESET)"
	@$(COMPOSE) build
	@echo "$(GREEN)Starting services...$(RESET)"
	@$(COMPOSE) up -d
	
list:
	@sleep 1
	@echo "$(GREEN)Listing running containers...$(RESET)"
	@docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

.PHONY: all clean fclean re build list down
