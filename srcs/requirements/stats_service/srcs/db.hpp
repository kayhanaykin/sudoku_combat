#pragma once                                              

#include <string>

#include <sqlite3.h>

namespace stats                                            
{
    std::string db_path();                                 

    bool init_schema();                                    

    sqlite3* open_db();                                    
    void close_db(sqlite3* db);                             
}
