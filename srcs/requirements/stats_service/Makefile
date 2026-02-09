# ----------------------------                     # Yorum: dosya başlığı
# Makefile (stats_service)                        # Yorum: hedef servis
# ----------------------------                     # Yorum: ayraç

NAME        = stats_server                         # Üreteceğimiz binary adı
CXX         = g++                                  # C++ derleyici

CXXFLAGS    = -Wall -Wextra -Werror                # Derleyici uyarıları
CXXFLAGS    += -std=c++17                          # C++ standardı
CXXFLAGS    += -I./tools                           # tools/ içindeki header'lar (asio/crow)
CXXFLAGS    += -DASIO_STANDALONE                   # Crow için standalone Asio

LDFLAGS     = -lpthread                            # Thread desteği
LDFLAGS     += -lsqlite3                           # SQLite link

SRCS        = $(wildcard srcs/*.cpp)               # srcs/ altındaki tüm .cpp dosyaları
OBJS        = $(SRCS:.cpp=.o)                      # .cpp -> .o dönüşümü

all: $(NAME)                                       # Varsayılan hedef

$(NAME): $(OBJS)                                   # Link aşaması
	$(CXX) $(CXXFLAGS) $(OBJS) -o $(NAME) $(LDFLAGS) # Binary üret

%.o: %.cpp                                          # Derleme kuralı
	$(CXX) $(CXXFLAGS) -c $< -o $@                   # .cpp -> .o

clean:                                              # Objeleri temizle
	rm -f $(OBJS)                                    # .o dosyalarını sil

fclean: clean                                       # Komple temizle
	rm -f $(NAME)                                    # Binary sil

re: fclean all                                      # Baştan derle

.PHONY: all clean fclean re                          # Phony hedefler
