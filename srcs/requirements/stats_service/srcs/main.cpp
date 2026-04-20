#include "includes.hpp"
#include "db.hpp"
#include "repository.hpp"
#include "json_utils.hpp"
#include "achievement_defs.hpp"
static bool valid_mode(const std::string &m)
{
    return (m == "online" || m == "offline");
}
static bool valid_result(const std::string &r)
{
    return (r == "win" || r == "lose");
}
static bool valid_diff(int d)
{
    return (d >= 1 && d <= 5);
}
static std::optional<int> leaderboard_label_to_diff(const std::string &label)
{
    if (label == "Total")
        return std::nullopt;
    if (label == "Easy")
        return 1;
    if (label == "Medium")
        return 2;
    if (label == "Hard")
        return 3;
    if (label == "Expert")
        return 4;
    if (label == "Extreme")
        return 5;
    return std::nullopt;
}
static crow::response achievements_response_by_user_id(long long user_id,
                                                       const std::optional<std::string> &username_hint = std::nullopt)
{
    if (user_id <= 0)
        return stats::make_error(400, "user_id must be > 0");
    try {
        auto earned = stats::get_user_achievements_by_id(user_id);
        std::map<std::string, stats::AchievementEntry> earned_map;
        for (const auto& a : earned) {
            earned_map.emplace(a.type, a);
        }
        pqxx::connection conn(stats::get_conn_string());
        pqxx::work tx(conn);
        std::string resolved_username;
        if (username_hint.has_value())
            resolved_username = username_hint.value();
        else
        {
            pqxx::result user_res = tx.exec_params(
                "SELECT username FROM player_stats WHERE user_id=$1 ORDER BY updated_at DESC LIMIT 1",
                user_id);
            if (!user_res.empty() && !user_res[0][0].is_null())
                resolved_username = user_res[0][0].as<std::string>();
        }
        auto is_leaderboard_achievement = [](const std::string &type) {
            return type == "star" || type.rfind("king_", 0) == 0;
        };
        crow::json::wvalue out;
        out["user_id"] = static_cast<int>(user_id);
        if (!resolved_username.empty())
            out["username"] = resolved_username;
        std::vector<crow::json::wvalue> arr;
        int earned_count = 0;
        const std::vector<stats::AchievementDefinition> &achievement_defs = stats::get_all_achievement_definitions();
        for (const auto& meta : achievement_defs) {
            int progress = 0;
            int target = meta.target;
            if (earned_map.find(meta.type) == earned_map.end()) {
                try {
                    if (meta.type == "first_win_online") {
                        pqxx::result res = tx.exec_params(
                            "SELECT SUM(wins) FROM player_stats WHERE user_id=$1 AND mode='online'",
                            user_id);
                        progress = (!res.empty() && !res[0][0].is_null()) ? res[0][0].as<int>() : 0;
                        progress = std::min(progress, 1);
                    }
                    else if (meta.type == "speedster_easy") {
                        pqxx::result res = tx.exec_params(
                            "SELECT COUNT(*) FROM match_history WHERE user_id=$1 AND difficulty=1 AND time_seconds < 120 AND result='win'",
                            user_id);
                        progress = (!res.empty() && !res[0][0].is_null()) ? res[0][0].as<int>() : 0;
                        progress = std::min(progress, 1);
                    }
                    else if (meta.type == "speedster_medium") {
                        pqxx::result res = tx.exec_params(
                            "SELECT COUNT(*) FROM match_history WHERE user_id=$1 AND difficulty=2 AND time_seconds < 240 AND result='win'",
                            user_id);
                        progress = (!res.empty() && !res[0][0].is_null()) ? res[0][0].as<int>() : 0;
                        progress = std::min(progress, 1);
                    }
                    else if (meta.type == "speedster_hard") {
                        pqxx::result res = tx.exec_params(
                            "SELECT COUNT(*) FROM match_history WHERE user_id=$1 AND difficulty=3 AND time_seconds < 360 AND result='win'",
                            user_id);
                        progress = (!res.empty() && !res[0][0].is_null()) ? res[0][0].as<int>() : 0;
                        progress = std::min(progress, 1);
                    }
                    else if (meta.type == "speedster_expert") {
                        pqxx::result res = tx.exec_params(
                            "SELECT COUNT(*) FROM match_history WHERE user_id=$1 AND difficulty=4 AND time_seconds < 480 AND result='win'",
                            user_id);
                        progress = (!res.empty() && !res[0][0].is_null()) ? res[0][0].as<int>() : 0;
                        progress = std::min(progress, 1);
                    }
                    else if (meta.type == "speedster_extreme") {
                        pqxx::result res = tx.exec_params(
                            "SELECT COUNT(*) FROM match_history WHERE user_id=$1 AND difficulty=5 AND time_seconds < 600 AND result='win'",
                            user_id);
                        progress = (!res.empty() && !res[0][0].is_null()) ? res[0][0].as<int>() : 0;
                        progress = std::min(progress, 1);
                    }
                    else if (meta.type == "on_fire_5x" || meta.type == "on_fire_10x" || meta.type == "on_fire_25x") {
                        pqxx::result res = tx.exec_params(
                            "SELECT COALESCE(current_streak, 0) FROM online_win_streaks WHERE user_id=$1",
                            user_id);
                        int current_streak = (!res.empty() && !res[0][0].is_null()) ? res[0][0].as<int>() : 0;
                        if (meta.type == "on_fire_5x") progress = std::min(current_streak, 5);
                        else if (meta.type == "on_fire_10x") progress = std::min(current_streak, 10);
                        else if (meta.type == "on_fire_25x") progress = std::min(current_streak, 25);
                    }
                    else if (meta.type == "graduate_offline") {
                        pqxx::result res = tx.exec_params(
                            "SELECT COUNT(DISTINCT difficulty) FROM player_stats WHERE user_id=$1 AND mode='offline' AND wins >= 20",
                            user_id);
                        progress = (!res.empty() && !res[0][0].is_null()) ? res[0][0].as<int>() : 0;
                        progress = std::min(progress, 5);
                    }
                    else if (meta.type == "graduate_online") {
                        pqxx::result res = tx.exec_params(
                            "SELECT COUNT(DISTINCT difficulty) FROM player_stats WHERE user_id=$1 AND mode='online' AND wins >= 20",
                            user_id);
                        progress = (!res.empty() && !res[0][0].is_null()) ? res[0][0].as<int>() : 0;
                        progress = std::min(progress, 5);
                    }
                    else if (meta.type == "star") {
                        target = 1;
                        std::optional<int> rank = stats::get_user_leaderboard_rank(user_id, std::nullopt, false);
                        if (rank.has_value())
                            progress = (rank.value() <= 50) ? 1 : 0;
                    }
                } catch (const std::exception& e) {
                    std::cerr << "Error calculating progress for " << meta.type << ": " << e.what() << std::endl;
                    progress = 0;
                }
                if (!is_leaderboard_achievement(meta.type)
                    && target > 0
                    && progress >= target
                    && !resolved_username.empty())
                {
                    try {
                        pqxx::result inserted = tx.exec_params(
                            "INSERT INTO user_achievements"
                            "  (user_id, username, achievement_type, name, icon, description)"
                            "  VALUES ($1,$2,$3,$4,$5,$6)"
                            "  ON CONFLICT(user_id, achievement_type) DO NOTHING"
                            "  RETURNING id, to_char(earned_at, 'YYYY-MM-DD\"T\"HH24:MI:SS\"Z\"')",
                            user_id, resolved_username, meta.type, meta.name, meta.icon, meta.description);
                        if (!inserted.empty())
                        {
                            stats::AchievementEntry unlocked_entry;
                            unlocked_entry.id = inserted[0][0].as<long long>();
                            unlocked_entry.type = meta.type;
                            unlocked_entry.name = meta.name;
                            unlocked_entry.icon = meta.icon;
                            unlocked_entry.description = meta.description;
                            unlocked_entry.earned_at = inserted[0][1].as<std::string>();
                            unlocked_entry.progress = 100;
                            unlocked_entry.target = 100;
                            earned_map.emplace(meta.type, unlocked_entry);
                        }
                    } catch (const std::exception &e) {
                        std::cerr << "Error retroactively unlocking " << meta.type << ": " << e.what() << std::endl;
                    }
                }
            }
            crow::json::wvalue row;
            row["type"] = meta.type;
            row["name"] = meta.name;
            row["icon"] = meta.icon;
            row["description"] = meta.description;
            row["progress"] = progress;
            row["target"] = target;
            if (earned_map.find(meta.type) != earned_map.end()) {
                const auto& e = earned_map[meta.type];
                row["id"] = e.id;
                row["earned_at"] = e.earned_at;
                row["progress"] = 100;
                row["target"] = 100;
                earned_count++;
            }
            arr.push_back(std::move(row));
        }
        tx.commit();
        out["total"] = static_cast<int>(achievement_defs.size());
        out["earned"] = earned_count;
        out["achievements"] = std::move(arr);
        return crow::response(200, out);
    } catch (const std::exception& e) {
        return stats::make_error(500, std::string("Error fetching achievements: ") + e.what());
    }
}
int main()
{
    if (!stats::init_db(10, 2000))
    {
        std::cerr << "stats_service: db init failed\n";
        return 1;
    }
    crow::SimpleApp app;
    CROW_ROUTE(app, "/api/stats/healthz")
    ([]()
    {
        crow::json::wvalue j;
        j["status"] = "ok";
        return crow::response(j);
    });
    CROW_ROUTE(app, "/api/stats/report").methods(crow::HTTPMethod::POST)
    ([](const crow::request &req)
    {
        auto body = crow::json::load(req.body);
        if (!body)
            return stats::make_error(400, "invalid json");
        if (!body.has("user_id") || !body.has("username") || !body.has("difficulty")
            || !body.has("mode") || !body.has("result"))
            return stats::make_error(400, "missing fields");
        long long   user_id  = body["user_id"].i();
        std::string username = body["username"].s();
        int         diff     = body["difficulty"].i();
        std::string mode     = body["mode"].s();
        std::string result   = body["result"].s();
        if (user_id <= 0)
            return stats::make_error(400, "user_id must be > 0");
        if (username.empty())
            return stats::make_error(400, "username empty");
        if (!valid_diff(diff))
            return stats::make_error(400, "difficulty must be 1..5");
        if (!valid_mode(mode))
            return stats::make_error(400, "mode must be online/offline");
        if (!valid_result(result))
            return stats::make_error(400, "result must be win/lose");
        std::optional<int> time_sec = std::nullopt;
        if (body.has("time_seconds"))
            time_sec = body["time_seconds"].i();
        if (mode == "offline" && result == "win" && !time_sec.has_value())
            return stats::make_error(400, "time_seconds required for offline win");
        std::string opponent;
        if (body.has("opponent"))
            opponent = body["opponent"].s();
        stats::Bucket b = stats::record_result(user_id, username, diff, mode, result, time_sec, opponent);
        crow::json::wvalue out;
        out["user_id"]    = static_cast<int>(user_id);
        out["username"]   = username;
        out["difficulty"] = diff;
        out["mode"]       = mode;
        out["bucket"]     = stats::bucket_to_json(b);
        return crow::response(200, out);
    });
    CROW_ROUTE(app, "/api/stats/<string>/history")
    ([](const std::string &username)
    {
        if (username.empty())
            return stats::make_error(400, "username empty");
        std::optional<long long> user_id = stats::find_user_id_by_username(username);
        if (!user_id.has_value())
            return stats::make_error(404, "user not found");
        auto entries = stats::get_match_history_by_id(user_id.value(), 20);
        return crow::response(200, stats::history_to_json(username, entries));
    });
    CROW_ROUTE(app, "/api/stats/leaderboard/<string>")
    ([](const crow::request &req, const std::string &difficulty_label)
    {
        if (difficulty_label != "Total" && difficulty_label != "Easy" && difficulty_label != "Medium"
            && difficulty_label != "Hard" && difficulty_label != "Expert" && difficulty_label != "Extreme")
            return stats::make_error(400, "mode must be Total/Easy/Medium/Hard/Expert/Extreme");
        std::string scope = "alltime";
        if (req.url_params.get("scope"))
            scope = req.url_params.get("scope");
        if (scope != "alltime" && scope != "weekly")
            return stats::make_error(400, "scope must be alltime/weekly");
        bool weekly = (scope == "weekly");
        int limit = 100;
        if (req.url_params.get("limit"))
        {
            std::string limit_str = req.url_params.get("limit");
            try
            {
                limit = std::stoi(limit_str);
            }
            catch (...)
            {
                return stats::make_error(400, "limit must be a number");
            }
            if (limit < 0)
                return stats::make_error(400, "limit must be >= 0");
        }
        std::optional<int> diff = leaderboard_label_to_diff(difficulty_label);
        auto entries = stats::get_leaderboard(diff, limit, weekly);
        crow::json::wvalue out;
        out["mode"] = difficulty_label;
        out["scope"] = scope;
        out["count"] = static_cast<int>(entries.size());
        if (weekly)
        {
            stats::WeeklyResetInfo info = stats::get_weekly_reset_info();
            out["period_start"] = info.period_start;
            out["next_reset_at"] = info.next_reset_at;
        }
        std::vector<crow::json::wvalue> arr;
        arr.reserve(entries.size());
        for (const auto &e : entries)
        {
            crow::json::wvalue row;
            row["user_id"] = static_cast<int>(e.user_id);
            row["username"] = e.username;
            row["display_name"] = e.username;
            row["wins"] = e.wins;
            row["losses"] = e.losses;
            row["games"] = e.games;
            row["winrate"] = e.winrate;
            row["score"] = e.score;
            arr.push_back(std::move(row));
        }
        out["data"] = std::move(arr);
        return crow::response(200, out);
    });
    CROW_ROUTE(app, "/api/stats/id/<int>/history")
    ([](int user_id)
    {
        if (user_id <= 0)
            return stats::make_error(400, "user_id must be > 0");
        auto entries = stats::get_match_history_by_id(user_id, 20);
        return crow::response(200, stats::history_to_json(std::to_string(user_id), entries));
    });
    CROW_ROUTE(app, "/api/stats/achievements/id/<int>")
    ([](int user_id)
    {
        return achievements_response_by_user_id(user_id);
    });
    CROW_ROUTE(app, "/api/stats/id/<int>/<int>")
    ([](int user_id, int diff)
    {
        if (user_id <= 0)
            return stats::make_error(400, "user_id must be > 0");
        if (!valid_diff(diff))
            return stats::make_error(400, "difficulty must be 1..5");
        auto rows = stats::get_user_diff_stats_by_id(user_id, diff);
        return crow::response(200, stats::stats_to_json(std::to_string(user_id), rows));
    });
    CROW_ROUTE(app, "/api/stats/id/<int>")
    ([](int user_id)
    {
        if (user_id <= 0)
            return stats::make_error(400, "user_id must be > 0");
        auto rows = stats::get_user_stats_by_id(user_id);
        return crow::response(200, stats::stats_to_json(std::to_string(user_id), rows));
    });
    CROW_ROUTE(app, "/api/stats/achievements/<string>")
    ([](const std::string &username)
    {
        if (username.empty())
            return stats::make_error(400, "username empty");
        std::optional<long long> resolved_user_id = stats::find_user_id_by_username(username);
        if (!resolved_user_id.has_value())
            return stats::make_error(404, "user not found");
        return achievements_response_by_user_id(resolved_user_id.value(), username);
    });
    CROW_ROUTE(app, "/api/stats/<string>/<int>")
    ([](const std::string &username, int diff)
    {
        if (username.empty())
            return stats::make_error(400, "username empty");
        if (!valid_diff(diff))
            return stats::make_error(400, "difficulty must be 1..5");
        std::optional<long long> user_id = stats::find_user_id_by_username(username);
        if (!user_id.has_value())
            return stats::make_error(404, "user not found");
        auto rows = stats::get_user_diff_stats_by_id(user_id.value(), diff);
        return crow::response(200, stats::stats_to_json(username, rows));
    });
    CROW_ROUTE(app, "/api/stats/<string>")
    ([](const std::string &username)
    {
        if (username.empty())
            return stats::make_error(400, "username empty");
        std::optional<long long> user_id = stats::find_user_id_by_username(username);
        if (!user_id.has_value())
            return stats::make_error(404, "user not found");
        auto rows = stats::get_user_stats_by_id(user_id.value());
        return crow::response(200, stats::stats_to_json(username, rows));
    });
    app.port(8090).multithreaded().run();
    return 0;
}
