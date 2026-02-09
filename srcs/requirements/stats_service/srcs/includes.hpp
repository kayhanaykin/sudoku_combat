#pragma once                                  // Header guard (tek sefer include)

#include <cstdlib>                            // getenv için
#include <cstring>                            // strcmp vb. için
#include <optional>                           // std::optional için
#include <string>                             // std::string için
#include <unordered_map>                      // map benzeri yapı için
#include <vector>                             // dinamik dizi için

#include <sqlite3.h>                          // SQLite C API

#include "asio.hpp"                           // Crow'un Asio bağımlılığı (tools/ içinden)
#include "crow_all.h"                         // Crow framework (tools/ içinden)
