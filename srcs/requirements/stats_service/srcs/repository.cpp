#include "repository.hpp"
#include "achievements.hpp"
#include <curl/curl.h>
#include <nlohmann/json.hpp>

using json = nlohmann::json;

namespace stats
{
    // Helper: Send achievement unlock to User Service
    static void unlock_achievement(const std::string &username, const std::string &achievement_type)
    {
        try
        {
            CURL *curl = curl_easy_init();
            if (!curl) return;

            std::string url = "http://user_service:8001/api/v1/user/achievements/";
            json payload;
            payload["username"] = username;
            payload["achievement_type"] = achievement_type;

            std::string post_data = payload.dump();

            curl_easy_setopt(curl, CURLOPT_URL, url.c_str());
            curl_easy_setopt(curl, CURLOPT_POSTFIELDS, post_data.c_str());
            curl_easy_setopt(curl, CURLOPT_TIMEOUT, 5L);

            struct curl_slist *headers = nullptr;
            headers = curl_slist_append(headers, "Content-Type: application/json");
            headers = curl_slist_append(headers, "Host: localhost");
            curl_easy_setopt(curl, CURLOPT_HTTPHEADER, headers);

            long http_code = 0;
            curl_easy_setopt(curl, CURLOPT_WRITEFUNCTION, +[](void*, size_t size, size_t nmemb, void*) {
                return size * nmemb;
            });

            CURLcode res = curl_easy_perform(curl);
            curl_easy_getinfo(curl, CURLINFO_RESPONSE_CODE, &http_code);

            if (res != CURLE_OK)
            {
                std::cerr << "Achievement unlock failed: " << curl_easy_strerror(res) << std::endl;
            }
            else if (http_code != 201 && http_code != 200)
            {
                std::cerr << "Achievement unlock failed with HTTP " << http_code << " for " << username 
                          << " - " << achievement_type << std::endl;
            }
            else
            {
                std::cout << "✓ Achievement unlocked: " << achievement_type << " for " << username << std::endl;
            }

            curl_slist_free_all(headers);
            curl_easy_cleanup(curl);
        }
        catch (const std::exception &e)
        {
            std::cerr << "Error unlocking achievement: " << e.what() << std::endl;
        }
    }

    static void ensure_weekly_period(pqxx::work &tx)
    {
        pqxx::result exists = tx.exec(
            "SELECT id FROM leaderboard_reset_meta WHERE id=1 FOR UPDATE"
        );

        if (exists.empty())
        {
            tx.exec(
                "INSERT INTO leaderboard_reset_meta (id, period_start, next_reset_at) "
                "VALUES ("
                "  1,"
                "  date_trunc('week', NOW()),"
                "  date_trunc('week', NOW()) + INTERVAL '7 days'"
                ")"
            );
            return;
        }

        bool should_reset = tx.exec(
            "SELECT NOW() >= next_reset_at "
            "FROM leaderboard_reset_meta "
            "WHERE id=1"
        )[0][0].as<bool>();

        if (should_reset)
        {
            tx.exec("TRUNCATE TABLE weekly_player_stats");
            tx.exec(
                "UPDATE leaderboard_reset_meta "
                "SET period_start = date_trunc('week', NOW()), "
                "    next_reset_at = date_trunc('week', NOW()) + INTERVAL '7 days' "
                "WHERE id=1"
            );
        }
    }

    static void upsert_weekly_stats(pqxx::work &tx,
                                    const std::string &username,
                                    int difficulty,
                                    const std::string &mode,
                                    int win_add,
                                    int lose_add)
    {
        tx.exec_params(
            "INSERT INTO weekly_player_stats"
            "  (username, difficulty, mode, wins, losses)"
            "  VALUES ($1,$2,$3,$4,$5)"
            "  ON CONFLICT(username, difficulty, mode) DO UPDATE SET"
            "    wins   = weekly_player_stats.wins   + EXCLUDED.wins,"
            "    losses = weekly_player_stats.losses + EXCLUDED.losses,"
            "    updated_at = NOW()",
            username, difficulty, mode, win_add, lose_add);
    }

    Bucket record_result(const std::string &username,
                         int difficulty,
                         const std::string &mode,
                         const std::string &result,
                         std::optional<int> time_sec,
                         const std::string &opponent)
    {
        int win_add  = (result == "win")  ? 1 : 0;
        int lose_add = (result == "lose") ? 1 : 0;

        bool has_time = (result == "win" && time_sec.has_value());

        pqxx::connection conn(get_conn_string());
        pqxx::work tx(conn);

        ensure_weekly_period(tx);

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

        if (mode == "online")
        {
            upsert_weekly_stats(tx, username, difficulty, mode, win_add, lose_add);
        }

        tx.commit();

        // Check achievements for all wins
        if (result == "win")
        {
            try
            {
                pqxx::connection checker_conn(get_conn_string());
                AchievementChecker checker(checker_conn);
                auto achievements = checker.check_achievements(username, difficulty, mode, result, time_sec);

                // Send each unlocked achievement to User Service
                for (const auto &ach : achievements)
                {
                    if (ach.unlocked)
                    {
                        unlock_achievement(ach.username, ach.achievement_type);
                        std::cout << "Achievement unlocked: " << ach.achievement_type << " for " << username << std::endl;
                    }
                }
            }
            catch (const std::exception &e)
            {
                std::cerr << "Error checking achievements: " << e.what() << std::endl;
            }
        }

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

    std::vector<LeaderboardEntry> get_leaderboard(std::optional<int> difficulty, int limit, bool weekly)
    {
        pqxx::connection conn(get_conn_string());
        pqxx::work tx(conn);

        if (weekly)
            ensure_weekly_period(tx);

        pqxx::result res;
        std::string table_name = weekly ? "weekly_player_stats" : "player_stats";

        if (difficulty.has_value())
        {
            std::string sql =
                "SELECT username, SUM(wins) AS wins, SUM(losses) AS losses"
                "  FROM " + table_name +
                "  WHERE difficulty=$1 AND mode='online'"
                "  GROUP BY username"
                "  HAVING SUM(wins + losses) > 0";

            res = tx.exec_params(sql, difficulty.value());
        }
        else
        {
            std::string sql =
                "SELECT username, SUM(wins) AS wins, SUM(losses) AS losses"
                "  FROM " + table_name +
                "  WHERE mode='online'"
                "  GROUP BY username"
                "  HAVING SUM(wins + losses) > 0";

            res = tx.exec(sql);
        }

        tx.commit();

        std::vector<LeaderboardEntry> entries;
        entries.reserve(res.size());

        for (const auto &row : res)
        {
            LeaderboardEntry e;
            e.username = row[0].as<std::string>();
            e.wins = row[1].as<int>();
            e.losses = row[2].as<int>();
            e.games = e.wins + e.losses;

            e.winrate = (e.games > 0)
                ? static_cast<double>(e.wins) / static_cast<double>(e.games)
                : 0.0;

            // Score formula: winrate-based + volume bonus
            // Scale: 0-10000 for winrate (0-100% → 0-10000) + 50 per game
            // Examples:
            // - 1 win, 0 losses: 10000 + 50 = 10050
            // - 10 wins, 2 losses (83.3% wr): 8333 + 600 = 8933
            // - 50 wins, 50 losses (50% wr): 5000 + 5000 = 10000
            // - 100 wins, 20 losses (83.3% wr): 8333 + 6000 = 14333
            const double prior_games = 10.0;
            const double prior_rate = 0.50;
            double adjusted_rate =
                (static_cast<double>(e.wins) + (prior_games * prior_rate))
                / (static_cast<double>(e.games) + prior_games);

            int winrate_score = static_cast<int>(adjusted_rate * 10000.0);
            int volume_score = static_cast<int>(e.games * 50);
            e.score = static_cast<double>(winrate_score + volume_score);

            entries.push_back(e);
        }

        std::sort(entries.begin(), entries.end(),
            [](const LeaderboardEntry &a, const LeaderboardEntry &b)
            {
                if (a.score != b.score)
                    return a.score > b.score;
                if (a.games != b.games)
                    return a.games > b.games;
                if (a.winrate != b.winrate)
                    return a.winrate > b.winrate;
                return a.username < b.username;
            });

        if (limit > 0 && static_cast<int>(entries.size()) > limit)
            entries.resize(static_cast<size_t>(limit));

        return entries;
    }

    WeeklyResetInfo get_weekly_reset_info()
    {
        pqxx::connection conn(get_conn_string());
        pqxx::work tx(conn);

        ensure_weekly_period(tx);

        pqxx::result res = tx.exec(
            "SELECT "
            "  to_char(period_start, 'YYYY-MM-DD\"T\"HH24:MI:SS\"Z\"'), "
            "  to_char(next_reset_at, 'YYYY-MM-DD\"T\"HH24:MI:SS\"Z\"') "
            "FROM leaderboard_reset_meta "
            "WHERE id=1"
        );

        tx.commit();

        WeeklyResetInfo info;
        if (!res.empty())
        {
            info.period_start = res[0][0].as<std::string>();
            info.next_reset_at = res[0][1].as<std::string>();
        }

        return info;
    }
}
