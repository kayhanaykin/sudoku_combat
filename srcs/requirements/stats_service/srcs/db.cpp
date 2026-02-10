#include "db.hpp"                                          

namespace stats                                            
{
    std::string db_path()                                  
    {
        const char* env = std::getenv("STATS_DB_PATH");     
        if (env && *env)                                   
            return std::string(env);                        
        return "/app/data/stats.db";                        
    }

    sqlite3* open_db()                                     
    {
        sqlite3* db = nullptr;                              
        std::string path = db_path();                       

        if (sqlite3_open(path.c_str(), &db) != SQLITE_OK)   
        {
            if (db)                                         
                sqlite3_close(db);                          
            return nullptr;                                 
        }

        sqlite3_busy_timeout(db, 2000);                     

        sqlite3_exec(db, "PRAGMA journal_mode=WAL;", 0, 0, 0);   
        sqlite3_exec(db, "PRAGMA synchronous=NORMAL;", 0, 0, 0); 

        return db;                                          
    }

    void close_db(sqlite3* db)                              
    {
        if (db)                                             
            sqlite3_close(db);                              
    }

    bool init_schema()                                      
    {
        sqlite3* db = open_db();                            
        if (!db)                                            
            return false;                                   

        const char* sql =                                   
            "CREATE TABLE IF NOT EXISTS player_stats ("
            "id INTEGER PRIMARY KEY AUTOINCREMENT,"
            "username TEXT NOT NULL,"
            "difficulty INTEGER NOT NULL,"
            "mode TEXT NOT NULL,"
            "wins INTEGER NOT NULL DEFAULT 0,"
            "losses INTEGER NOT NULL DEFAULT 0,"
            "best_time_seconds INTEGER,"
            "updated_at TEXT NOT NULL DEFAULT (datetime('now')),"
            "UNIQUE(username, difficulty, mode)"
            ");"
            "CREATE INDEX IF NOT EXISTS idx_player_stats_username "
            "ON player_stats(username);";

        char* err = nullptr;                                
        int rc = sqlite3_exec(db, sql, nullptr, nullptr, &err); 

        if (rc != SQLITE_OK)                                
        {
            if (err)                                        
                sqlite3_free(err);                          
            close_db(db);                                   
            return false;                                   
        }

        close_db(db);                                       
        return true;                                        
    }
}
