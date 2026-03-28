#include "db.hpp"

#include <chrono>
#include <thread>

namespace stats
{
    static std::string get_env(const char *key, const char *fallback)
    {
        const char *val = std::getenv(key);
        if (val && val[0] != '\0')
            return val;
        return fallback;
    }

    std::string get_conn_string()
    {
        std::string host = get_env("STATS_DB_HOST", "statistics_db");
        std::string port = get_env("STATS_DB_PORT", "5432");
        std::string db   = get_env("STATS_DB_NAME", "game_stats_db");
        std::string user = get_env("STATS_DB_USER", "bn_user");
        std::string pass = get_env("STATS_DB_PASS", "bn_pass");

        return "host=" + host
             + " port=" + port
             + " dbname=" + db
             + " user=" + user
             + " password=" + pass;
    }

    static void create_tables()
    {
        pqxx::connection conn(get_conn_string());
        pqxx::work tx(conn);

        tx.exec(
            "CREATE TABLE IF NOT EXISTS player_stats ("
            "  id             BIGSERIAL PRIMARY KEY,"
            "  username        TEXT NOT NULL,"
            "  difficulty      INT  NOT NULL,"
            "  mode            TEXT NOT NULL,"
            "  wins            INT  NOT NULL DEFAULT 0,"
            "  losses          INT  NOT NULL DEFAULT 0,"
            "  best_time_seconds INT,"
            "  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),"
            "  UNIQUE(username, difficulty, mode)"
            ")"
        );

        tx.exec(
            "CREATE INDEX IF NOT EXISTS idx_ps_username "
            "ON player_stats(username)"
        );

        tx.exec(
            "CREATE TABLE IF NOT EXISTS match_history ("
            "  id              BIGSERIAL PRIMARY KEY,"
            "  username         TEXT NOT NULL,"
            "  opponent         TEXT,"
            "  difficulty       INT  NOT NULL,"
            "  mode             TEXT NOT NULL,"
            "  result           TEXT NOT NULL,"
            "  time_seconds     INT,"
            "  played_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()"
            ")"
        );

        tx.exec(
            "CREATE INDEX IF NOT EXISTS idx_mh_username "
            "ON match_history(username)"
        );

        tx.exec(
            "CREATE TABLE IF NOT EXISTS weekly_player_stats ("
            "  id              BIGSERIAL PRIMARY KEY,"
            "  username        TEXT NOT NULL,"
            "  difficulty      INT  NOT NULL,"
            "  mode            TEXT NOT NULL,"
            "  wins            INT  NOT NULL DEFAULT 0,"
            "  losses          INT  NOT NULL DEFAULT 0,"
            "  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),"
            "  UNIQUE(username, difficulty, mode)"
            ")"
        );

        tx.exec(
            "CREATE INDEX IF NOT EXISTS idx_wps_mode_diff "
            "ON weekly_player_stats(mode, difficulty)"
        );

        tx.exec(
            "CREATE TABLE IF NOT EXISTS leaderboard_reset_meta ("
            "  id            INT PRIMARY KEY,"
            "  period_start  TIMESTAMPTZ NOT NULL,"
            "  next_reset_at TIMESTAMPTZ NOT NULL"
            ")"
        );

        tx.exec(
            "INSERT INTO leaderboard_reset_meta (id, period_start, next_reset_at) "
            "VALUES (1, date_trunc('week', NOW()), date_trunc('week', NOW()) + INTERVAL '7 days') "
            "ON CONFLICT (id) DO NOTHING"
        );

        tx.exec(
            "UPDATE player_stats ps "
            "SET best_time_seconds = src.min_time "
            "FROM ("
            "  SELECT username, difficulty, mode, MIN(time_seconds) AS min_time "
            "  FROM match_history "
            "  WHERE result = 'win' AND time_seconds IS NOT NULL "
            "  GROUP BY username, difficulty, mode"
            ") src "
            "WHERE ps.username = src.username "
            "  AND ps.difficulty = src.difficulty "
            "  AND ps.mode = src.mode "
            "  AND (ps.best_time_seconds IS NULL OR src.min_time < ps.best_time_seconds)"
        );

        tx.commit();
    }

    bool init_db(int retries, int wait_ms)
    {
        for (int i = 0; i < retries; i++)
        {
            try
            {
                create_tables();
                return true;
            }
            catch (const std::exception &e)
            {
                std::cerr << "db not ready: " << e.what() << "\n";
                std::this_thread::sleep_for(std::chrono::milliseconds(wait_ms));
            }
        }
        return false;
    }
}
