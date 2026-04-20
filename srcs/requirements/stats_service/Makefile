NAME = stats_server
CXX = g++
PKG_CONFIG ?= pkg-config

CXXFLAGS = -Wall -Wextra -Werror
CXXFLAGS += -std=c++17
CXXFLAGS += -Wno-type-limits
CXXFLAGS += -Wno-deprecated-declarations
CXXFLAGS += -I./tools
CXXFLAGS += -DASIO_STANDALONE

LDFLAGS = -lpthread
LDFLAGS += -lcurl

PQXX_CFLAGS := $(shell $(PKG_CONFIG) --cflags libpqxx 2>/dev/null)
PQXX_LIBS := $(shell $(PKG_CONFIG) --libs libpqxx 2>/dev/null)

ifeq ($(strip $(PQXX_LIBS)),)
BREW_PREFIX := $(shell brew --prefix 2>/dev/null)
BREW_LIBPQ_PREFIX := $(shell brew --prefix libpq 2>/dev/null)
ifneq ($(strip $(BREW_PREFIX)),)
CXXFLAGS += -I$(BREW_PREFIX)/include
LDFLAGS += -L$(BREW_PREFIX)/lib
endif
ifneq ($(strip $(BREW_LIBPQ_PREFIX)),)
CXXFLAGS += -I$(BREW_LIBPQ_PREFIX)/include
LDFLAGS += -L$(BREW_LIBPQ_PREFIX)/lib
endif
LDFLAGS += -lpqxx -lpq
else
CXXFLAGS += $(PQXX_CFLAGS)
LDFLAGS += $(PQXX_LIBS)
endif

SRCS = $(filter-out srcs/repository_orm.cpp, $(wildcard srcs/*.cpp))
OBJS = $(SRCS:.cpp=.o)


all: $(NAME)

orm: $(NAME_ORM)

$(NAME): $(OBJS)
	$(CXX) $(CXXFLAGS) $(OBJS) -o $(NAME) $(LDFLAGS)

%.o: %.cpp
	$(CXX) $(CXXFLAGS) -c $< -o $@

$(NAME_ORM): $(OBJS_ORM)
	$(CXX) $(CXXFLAGS) $(OBJS_ORM) -o $(NAME_ORM) $(LDFLAGS)

clean:
	rm -f $(OBJS) $(OBJS_ORM)

fclean: clean
	rm -f $(NAME) $(NAME_ORM)

re: fclean all

.PHONY: all clean fclean re
