#include "repository.hpp"

namespace stats
{
    Bucket record_result(const std::string &username,
                         int difficulty,
                         const std::string &mode,
                         const std::string &result,
                         std::optional<int> time_sec,
                         const std::string &opponent)
    {
        int win_add  = (result == "win")  ? 1 : 0;
        int lose_add = (result == "lose") ? 1 : 0;

        bool has_time = (mode == "offline" && result == "win" && time_sec.has_value());

        pqxx::connection conn(get_conn_string());
        pqxx::work tx(conn);

        /* --- player_stats upsert --- */
        if (has_time)
        {
            tx.exec_params(
                "INSERT INTO player_stats"
                "  (username, difficulty, mode, wins, losses, best_time_seconds)"
                "  VALUES ($1,$2,$3,$4,$5,$6)"
                "  ON CONFLICT(username, difficulty, mode) DO UPDATE SET"
                "    wins   = player_stats.wins   + EXCLUDED.wins,"
                "    losses = player_stats.losses + EXCLUDED.losses,"
                "    best_time_seconds = CASE"
                "      WHEN EXCLUDED.best_time_seconds IS NULL THEN player_stats.best_time_seconds"
                "      WHEN player_stats.best_time_seconds IS NULL THEN EXCLUDED.best_time_seconds"
                "      WHEN EXCLUDED.best_time_seconds < player_stats.best_time_seconds"
                "        THEN EXCLUDED.best_time_seconds"
                "      ELSE player_stats.best_time_seconds END,"
                "    updated_at = NOW()",
                username, difficulty, mode, win_add, lose_add, time_sec.value());
        }
        else
        {
            tx.exec_params(
                "INSERT INTO player_stats"
                "  (username, difficulty, mode, wins, losses)"
                "  VALUES ($1,$2,$3,$4,$5)"
                "  ON CONFLICT(username, difficulty, mode) DO UPDATE SET"
                "    wins   = player_stats.wins   + EXCLUDED.wins,"
                "    losses = player_stats.losses + EXCLUDED.losses,"
                "    updated_at = NOW()",
                username, difficulty, mode, win_add, lose_add);
        }

        /* --- match_history insert --- */
        if (time_sec.has_value())
        {
            tx.exec_params(
                "INSERT INTO match_history"
                "  (username, opponent, difficulty, mode, result, time_seconds)"
                "  VALUES ($1,$2,$3,$4,$5,$6)",
                username,
                opponent.empty() ? std::optional<std::string>(std::nullopt)
                                 : std::optional<std::string>(opponent),
                difficulty, mode, result, time_sec.value());
        }
        else
        {
            tx.exec_params(
                "INSERT INTO match_history"
                "  (username, opponent, difficulty, mode, result)"
                "  VALUES ($1,$2,$3,$4,$5)",
                username,
                opponent.empty() ? std::optional<std::string>(std::nullopt)
                                 : std::optional<std::string>(opponent),
                difficulty, mode, result);
        }

        /* --- read back current bucket --- */
        pqxx::result res = tx.exec_params(
            "SELECT wins, losses, best_time_seconds"
            "  FROM player_stats"
            "  WHERE username=$1 AND difficulty=$2 AND mode=$3",
            username, difficulty, mode);

        tx.commit();

        Bucket b = {0, 0, std::nullopt};
        if (!res.empty())
        {
            b.wins   = res[0][0].as<int>();
            b.losses = res[0][1].as<int>();
            if (!res[0][2].is_null())
                b.best_time = res[0][2].as<int>();
        }
        return b;
    }

    static std::vector<StatsRow> run_select(const std::string &sql,
                                            const std::string &username,
                                            std::optional<int> diff)
    {
        pqxx::connection conn(get_conn_string());
        pqxx::work tx(conn);

        pqxx::result res;
        if (diff.has_value())
            res = tx.exec_params(sql, username, diff.value());
        else
            res = tx.exec_params(sql, username);
        tx.commit();

        std::vector<StatsRow> rows;
        for (const auto &row : res)
        {
            StatsRow sr;
            sr.difficulty    = row[0].as<int>();
            sr.mode          = row[1].as<std::string>();
            sr.bucket.wins   = row[2].as<int>();
            sr.bucket.losses = row[3].as<int>();
            sr.bucket.best_time = std::nullopt;
            if (!row[4].is_null())
                sr.bucket.best_time = row[4].as<int>();
            rows.push_back(sr);
        }
        return rows;
    }

    std::vector<StatsRow> get_user_stats(const std::string &username)
    {
        return run_select(
            "SELECT difficulty, mode, wins, losses, best_time_seconds"
            "  FROM player_stats"
            "  WHERE username=$1"
            "  ORDER BY difficulty, mode",
            username, std::nullopt);
    }

    std::vector<StatsRow> get_user_diff_stats(const std::string &username, int difficulty)
    {
        return run_select(
            "SELECT difficulty, mode, wins, losses, best_time_seconds"
            "  FROM player_stats"
            "  WHERE username=$1 AND difficulty=$2"
            "  ORDER BY mode",
            username, difficulty);
    }

    std::vector<MatchEntry> get_match_history(const std::string &username, int limit)
    {
        pqxx::connection conn(get_conn_string());
        pqxx::work tx(conn);

        pqxx::result res = tx.exec_params(
            "SELECT opponent, difficulty, mode, result, time_seconds,"
            "       to_char(played_at, 'YYYY-MM-DD\"T\"HH24:MI:SS\"Z\"')"
            "  FROM match_history"
            "  WHERE username=$1"
            "  ORDER BY played_at DESC"
            "  LIMIT $2",
            username, limit);
        tx.commit();

        std::vector<MatchEntry> entries;
        for (const auto &row : res)
        {
            MatchEntry me;
            me.opponent   = row[0].is_null() ? "" : row[0].as<std::string>();
            me.difficulty = row[1].as<int>();
            me.mode       = row[2].as<std::string>();
            me.result     = row[3].as<std::string>();
            me.time_seconds = std::nullopt;
            if (!row[4].is_null())
                me.time_seconds = row[4].as<int>();
            me.played_at  = row[5].as<std::string>();
            entries.push_back(me);
        }
        return entries;
    }
}
