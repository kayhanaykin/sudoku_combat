NAME = stats_server
CXX = g++

CXXFLAGS = -Wall -Wextra -Werror
CXXFLAGS += -std=c++17
CXXFLAGS += -Wno-type-limits
CXXFLAGS += -I./tools
CXXFLAGS += -DASIO_STANDALONE

LDFLAGS = -lpthread
LDFLAGS += -lsqlite3

SRCS = $(wildcard srcs/*.cpp)
OBJS = $(SRCS:.cpp=.o)

all: $(NAME)

$(NAME): $(OBJS)
	$(CXX) $(CXXFLAGS) $(OBJS) -o $(NAME) $(LDFLAGS)

%.o: %.cpp
	$(CXX) $(CXXFLAGS) -c $< -o $@

clean:
	rm -f $(OBJS)

fclean: clean
	rm -f $(NAME)

re: fclean all

.PHONY: all clean fclean re
