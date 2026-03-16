export COMPOSE_BAKE=true

GREEN = \033[0;32m
RESET = \033[0m

COMPOSE = docker compose -f srcs/docker-compose.yml

all: build list

down:
	@echo "$(GREEN)Stopping services...$(RESET)"
	@$(COMPOSE) down

# Projeyi, ağları ve VOLUMELERİ (Veritabanı kalıntılarını) tamamen siler!
clean:
	@echo "$(GREEN)Force removing containers and VOLUMES...$(RESET)"
	@$(COMPOSE) down -v --remove-orphans

# Sistemi tamamen temizler (Docker içindeki her şeyi)
fclean: clean
	@echo "$(GREEN)Deep cleaning the system...$(RESET)"
	@docker system prune -af
	@docker volume prune -f

re: clean all

# Yeniden build edip ayağa kaldırır
build:
	@echo "$(GREEN)Building and starting containers...$(RESET)"
	@$(COMPOSE) up -d --build

build-%:
	@echo "$(GREEN)Building and starting containers...$(RESET)"
	@$(COMPOSE) up -d --build $*

list:
	@sleep 1
	@echo "$(GREEN)Listing running containers...$(RESET)"
	@docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

migrate:
	@echo "$(GREEN)Running migrations...$(RESET)"
	@$(COMPOSE) exec user_service python manage.py makemigrations
	@$(COMPOSE) exec user_service python manage.py migrate

seed:
	@$(COMPOSE) exec user_service python seed_db.py

logs-%:
	@$(COMPOSE) logs $* --tail 1000000

.PHONY: all clean fclean re build list down migrate logs up seed