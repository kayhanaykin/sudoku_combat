#include "repository.hpp"
#include "achievements.hpp"
#include "achievement_defs.hpp"
namespace stats
{
    static double wilson_lower_bound(int wins, int losses)
    {
        const int n_int = wins + losses;
        if (n_int <= 0)
            return 0.0;
        const double n = static_cast<double>(n_int);
        const double z = 1.96;
        const double z2 = z * z;
        const double p_hat = static_cast<double>(wins) / n;
        const double numerator = p_hat + (z2 / (2.0 * n))
            - z * std::sqrt((p_hat * (1.0 - p_hat) + (z2 / (4.0 * n))) / n);
        const double denominator = 1.0 + (z2 / n);
        double lower_bound = numerator / denominator;
        if (lower_bound < 0.0)
            lower_bound = 0.0;
        if (lower_bound > 1.0)
            lower_bound = 1.0;
        return lower_bound;
    }
    static const AchievementDefinition *get_achievement_meta(const std::string &achievement_type)
    {
        return find_achievement_definition(achievement_type);
    }
    static bool unlock_achievement(long long user_id,
                                   const std::string &username,
                                   const std::string &achievement_type)
    {
        try
        {
            const AchievementDefinition *meta = get_achievement_meta(achievement_type);
            std::string achievement_name = achievement_type;
            std::string achievement_icon = "🏆";
            std::string description = "Unlocked achievement: " + achievement_type;
            if (meta)
            {
                achievement_name = meta->name;
                achievement_icon = meta->icon;
                description = meta->description;
            }
            pqxx::connection conn(get_conn_string());
            pqxx::work tx(conn);
            pqxx::result res = tx.exec_params(
                "INSERT INTO user_achievements"
                "  (user_id, username, achievement_type, name, icon, description)"
                "  VALUES ($1,$2,$3,$4,$5,$6)"
                "  ON CONFLICT(user_id, achievement_type) DO NOTHING"
                "  RETURNING id",
                user_id, username, achievement_type, achievement_name, achievement_icon, description);
            tx.commit();
            return !res.empty();
        }
        catch (const std::exception &e)
        {
            std::cerr << "Error unlocking achievement: " << e.what() << std::endl;
            return false;
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
                                    long long user_id,
                                    const std::string &username,
                                    int difficulty,
                                    const std::string &mode,
                                    int win_add,
                                    int lose_add)
    {
        tx.exec_params(
            "INSERT INTO weekly_player_stats"
                "  (user_id, username, difficulty, mode, wins, losses)"
                "  VALUES ($1,$2,$3,$4,$5,$6)"
                "  ON CONFLICT(user_id, difficulty, mode) DO UPDATE SET"
            "    wins   = weekly_player_stats.wins   + EXCLUDED.wins,"
            "    losses = weekly_player_stats.losses + EXCLUDED.losses,"
            "    updated_at = NOW()",
                user_id, username, difficulty, mode, win_add, lose_add);
    }
    Bucket record_result(long long user_id,
                     const std::string &username,
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
        if (has_time)
        {
            tx.exec_params(
                "INSERT INTO player_stats"
                "  (user_id, username, difficulty, mode, wins, losses, best_time_seconds)"
                "  VALUES ($1,$2,$3,$4,$5,$6,$7)"
                "  ON CONFLICT(user_id, difficulty, mode) DO UPDATE SET"
                "    username = EXCLUDED.username,"
                "    wins   = player_stats.wins   + EXCLUDED.wins,"
                "    losses = player_stats.losses + EXCLUDED.losses,"
                "    best_time_seconds = CASE"
                "      WHEN EXCLUDED.best_time_seconds IS NULL THEN player_stats.best_time_seconds"
                "      WHEN player_stats.best_time_seconds IS NULL THEN EXCLUDED.best_time_seconds"
                "      WHEN EXCLUDED.best_time_seconds < player_stats.best_time_seconds"
                "        THEN EXCLUDED.best_time_seconds"
                "      ELSE player_stats.best_time_seconds END,"
                "    updated_at = NOW()",
                user_id, username, difficulty, mode, win_add, lose_add, time_sec.value());
        }
        else
        {
            tx.exec_params(
                "INSERT INTO player_stats"
                "  (user_id, username, difficulty, mode, wins, losses)"
                "  VALUES ($1,$2,$3,$4,$5,$6)"
                "  ON CONFLICT(user_id, difficulty, mode) DO UPDATE SET"
                "    username = EXCLUDED.username,"
                "    wins   = player_stats.wins   + EXCLUDED.wins,"
                "    losses = player_stats.losses + EXCLUDED.losses,"
                "    updated_at = NOW()",
                user_id, username, difficulty, mode, win_add, lose_add);
        }
        if (time_sec.has_value())
        {
            tx.exec_params(
                "INSERT INTO match_history"
                "  (user_id, username, opponent, difficulty, mode, result, time_seconds)"
                "  VALUES ($1,$2,$3,$4,$5,$6,$7)",
                user_id,
                username,
                opponent.empty() ? std::optional<std::string>(std::nullopt)
                                 : std::optional<std::string>(opponent),
                difficulty, mode, result, time_sec.value());
        }
        else
        {
            tx.exec_params(
                "INSERT INTO match_history"
                "  (user_id, username, opponent, difficulty, mode, result)"
                "  VALUES ($1,$2,$3,$4,$5,$6)",
                user_id,
                username,
                opponent.empty() ? std::optional<std::string>(std::nullopt)
                                 : std::optional<std::string>(opponent),
                difficulty, mode, result);
        }
        pqxx::result res = tx.exec_params(
            "SELECT wins, losses, best_time_seconds"
            "  FROM player_stats"
            "  WHERE user_id=$1 AND difficulty=$2 AND mode=$3",
            user_id, difficulty, mode);
        if (mode == "online")
        {
            upsert_weekly_stats(tx, user_id, username, difficulty, mode, win_add, lose_add);
            tx.exec_params(
                "INSERT INTO online_win_streaks (user_id, username, current_streak) "
                "VALUES ($1, $2, CASE WHEN $3='win' THEN 1 ELSE 0 END) "
                "ON CONFLICT (user_id) DO UPDATE SET "
                "  username = EXCLUDED.username, "
                "  current_streak = CASE "
                "    WHEN $3='win' THEN online_win_streaks.current_streak + 1 "
                "    ELSE 0 "
                "  END, "
                "  updated_at = NOW()",
                user_id, username, result);
        }
        tx.commit();
        if (result == "win")
        {
            try
            {
                pqxx::connection checker_conn(get_conn_string());
                AchievementChecker checker(checker_conn);
                auto achievements = checker.check_achievements(user_id, username, difficulty, mode, result, time_sec);
                for (const auto &ach : achievements)
                {
                    if (ach.unlocked)
                    {
                        if (unlock_achievement(ach.user_id, ach.username, ach.achievement_type))
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
    static std::vector<StatsRow> run_select_by_id(const std::string &sql,
                                                  long long user_id,
                                                  std::optional<int> diff)
    {
        pqxx::connection conn(get_conn_string());
        pqxx::work tx(conn);
        pqxx::result res;
        if (diff.has_value())
            res = tx.exec_params(sql, user_id, diff.value());
        else
            res = tx.exec_params(sql, user_id);
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
    std::vector<StatsRow> get_user_stats_by_id(long long user_id)
    {
        return run_select_by_id(
            "SELECT difficulty, mode, wins, losses, best_time_seconds"
            "  FROM player_stats"
            "  WHERE user_id=$1"
            "  ORDER BY difficulty, mode",
            user_id, std::nullopt);
    }
    std::vector<StatsRow> get_user_diff_stats_by_id(long long user_id, int difficulty)
    {
        return run_select_by_id(
            "SELECT difficulty, mode, wins, losses, best_time_seconds"
            "  FROM player_stats"
            "  WHERE user_id=$1 AND difficulty=$2"
            "  ORDER BY mode",
            user_id, difficulty);
    }
    std::vector<MatchEntry> get_match_history_by_id(long long user_id, int limit)
    {
        pqxx::connection conn(get_conn_string());
        pqxx::work tx(conn);
        pqxx::result res = tx.exec_params(
            "SELECT opponent, difficulty, mode, result, time_seconds,"
            "       to_char(played_at, 'YYYY-MM-DD\"T\"HH24:MI:SS\"Z\"')"
            "  FROM match_history"
            "  WHERE user_id=$1"
            "  ORDER BY played_at DESC"
            "  LIMIT $2",
            user_id, limit);
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
                "SELECT user_id, MAX(username) AS username, SUM(wins) AS wins, SUM(losses) AS losses"
                "  FROM " + table_name +
                "  WHERE difficulty=$1 AND mode='online' AND user_id IS NOT NULL"
                "  GROUP BY user_id"
                "  HAVING SUM(wins + losses) > 0";
            res = tx.exec_params(sql, difficulty.value());
        }
        else
        {
            std::string sql =
                "SELECT user_id, MAX(username) AS username, SUM(wins) AS wins, SUM(losses) AS losses"
                "  FROM " + table_name +
                "  WHERE mode='online' AND user_id IS NOT NULL"
                "  GROUP BY user_id"
                "  HAVING SUM(wins + losses) > 0";
            res = tx.exec(sql);
        }
        tx.commit();
        std::vector<LeaderboardEntry> entries;
        entries.reserve(res.size());
        for (const auto &row : res)
        {
            if (row[0].is_null())
                continue;
            LeaderboardEntry e;
            e.user_id = row[0].as<long long>();
            e.username = row[1].as<std::string>();
            e.wins = row[2].as<int>();
            e.losses = row[3].as<int>();
            e.games = e.wins + e.losses;
            e.winrate = (e.games > 0)
                ? static_cast<double>(e.wins) / static_cast<double>(e.games)
                : 0.0;
            const double wilson = wilson_lower_bound(e.wins, e.losses);
            e.score = std::round(wilson * 10000.0);
            entries.push_back(e);
        }
        auto leaderboard_cmp = [](const LeaderboardEntry &a, const LeaderboardEntry &b)
        {
            if (a.score != b.score)
                return a.score > b.score;
            if (a.games != b.games)
                return a.games > b.games;
            if (a.winrate != b.winrate)
                return a.winrate > b.winrate;
            return a.user_id < b.user_id;
        };
        if (limit > 0 && static_cast<int>(entries.size()) > limit)
        {
            auto cutoff = entries.begin() + limit;
            std::nth_element(entries.begin(), cutoff, entries.end(), leaderboard_cmp);
            entries.resize(static_cast<size_t>(limit));
        }
        std::sort(entries.begin(), entries.end(), leaderboard_cmp);
        return entries;
    }
    std::optional<int> get_user_leaderboard_rank(long long user_id, std::optional<int> difficulty, bool weekly)
    {
        std::vector<LeaderboardEntry> entries = get_leaderboard(difficulty, 0, weekly);
        for (size_t i = 0; i < entries.size(); ++i)
        {
            if (entries[i].user_id == user_id)
                return static_cast<int>(i + 1);
        }
        return std::nullopt;
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
    std::vector<AchievementEntry> get_user_achievements_by_id(long long user_id)
    {
        pqxx::connection conn(get_conn_string());
        pqxx::work tx(conn);
        pqxx::result res = tx.exec_params(
            "SELECT "
            "  id, achievement_type, name, icon, description, "
            "  to_char(earned_at, 'YYYY-MM-DD\"T\"HH24:MI:SS\"Z\"') "
            "FROM user_achievements "
            "WHERE user_id=$1 "
            "ORDER BY earned_at DESC",
            user_id
        );
        tx.commit();
        std::vector<AchievementEntry> entries;
        entries.reserve(res.size());
        for (const auto &row : res)
        {
            AchievementEntry e;
            e.id = row[0].as<long long>();
            e.type = row[1].as<std::string>();
            e.name = row[2].as<std::string>();
            e.icon = row[3].as<std::string>();
            e.description = row[4].as<std::string>();
            e.earned_at = row[5].as<std::string>();
            e.progress = 100;
            e.target = 100;
            entries.push_back(e);
        }
        return entries;
    }
}
