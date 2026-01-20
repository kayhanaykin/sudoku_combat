# Compose automatically looks for a file named .env 
# in the directory where the docker compose command is run.

COMPOSE = docker compose -f srcs/docker-compose.yml

# --build eger dockerfile degistiyse, 
# docker-compose yeni versiyon var mi diye check etmeden, 
# eski image i kullaniyor.
# --build dockerfile da bir revizyon varsa yeniden image olusturuyor.
# -d detached mode, docker-compose terminali ele gecirmesin diye.
# sureki loglamaya devam ediyor.
all: build list

clean:
	$(COMPOSE) down

fclean: clean
	docker system prune -a --force
	docker volume prune --force

prune:
	docker system prune -af

re: clean all

build: 
	$(COMPOSE) build
	$(COMPOSE) up -d
	
list:
	@sleep 1
	@echo ""
	docker ps -a

.PHONY: all clean fclean re build list
