NAME = myprogram
SRCS = main.cpp gen_full_grid.cpp gen_game_grid.cpp utils.cpp
OBJS = $(SRCS:.cpp=.o)
GXX	 = c++
CXXFLAGS = -Wall -Wextra -Werror

all: $(NAME)

$(NAME): $(OBJS)
	$(GXX) $(OBJS) $(CXXFLAGS) -o $(NAME)

clean:
	rm -f $(OBJS)

fclean: clean
	rm -f $(NAME)

re: fclean all

run:
	./$(NAME)

.PHONY: all clean fclean re