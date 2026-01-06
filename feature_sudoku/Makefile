NAME = myprogram
SRCS = main.cpp full_grid.cpp game_grid.cpp utils.cpp tester.cpp human_logic.cpp play.cpp
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

run: $(NAME)
	./$(NAME)

file: $(NAME)
	./$(NAME) > output.txt

.PHONY: all clean fclean re