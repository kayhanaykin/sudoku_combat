NAME        = sudoku_server
CXX         = g++
# Flags including our tools folder and standalone Asio mode, standalone discards 500mb unessary lib download
CXXFLAGS    = -Wall -Wextra -Werror -std=c++17 -I./tools -DASIO_STANDALONE
# to link the POSIX Threads library
LDFLAGS     = -lpthread

# Locate all source files in the src/ directory
SRCS        = $(wildcard srcs/*.cpp)
# Shorthand to change .cpp to .o (keeps the src/ prefix)
OBJS        = $(SRCS:.cpp=.o)

all: $(NAME)

# Link the executable
$(NAME): $(OBJS)
	$(CXX) $(CXXFLAGS) $(OBJS) -o $(NAME) $(LDFLAGS)

%.o: %.cpp
	$(CXX) $(CXXFLAGS) -c $< -o $@

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