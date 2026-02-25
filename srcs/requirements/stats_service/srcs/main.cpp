#include "includes.hpp"
#include "db.hpp"
#include "repository.hpp"
#include "json_utils.hpp"

static bool is_valid_mode(const std::string& mode)
{
    return (mode == "online" || mode == "offline");
}

static bool is_valid_result(const std::string& result)
{
    return (result == "win" || result == "lose");
}

static bool is_valid_difficulty(int d)
{
    return (d >= 1 && d <= 5);
}

int main()
{
    if (!stats::init_schema())
    {
        std::cerr << "stats_service: schema init failed\n";
        return 1;
    }

    crow::SimpleApp app;

    CROW_ROUTE(app, "/api/stats/healthz")
    ([]()
    {
        crow::json::wvalue res;
        res["status"] = "ok";
        return crow::response(res);
    });

    CROW_ROUTE(app, "/api/stats/report").methods(crow::HTTPMethod::POST)
    ([](const crow::request& req)
    {
        auto body = crow::json::load(req.body);
        if (!body)
            return stats::error_json(400, "invalid json");

        if (!body.has("username") || !body.has("difficulty") || !body.has("mode") || !body.has("result"))
            return stats::error_json(400, "missing fields");

        std::string username = body["username"].s();
        int difficulty = body["difficulty"].i();
        std::string mode = body["mode"].s();
        std::string result = body["result"].s();

        if (username.empty())
            return stats::error_json(400, "username empty");
        if (!is_valid_difficulty(difficulty))
            return stats::error_json(400, "difficulty must be 1..5");
        if (!is_valid_mode(mode))
            return stats::error_json(400, "mode must be online/offline");
        if (!is_valid_result(result))
            return stats::error_json(400, "result must be win/lose");

        std::optional<int> time_seconds = std::nullopt;
        if (body.has("time_seconds"))
            time_seconds = body["time_seconds"].i();

        if (mode == "offline" && result == "win" && !time_seconds.has_value())
            return stats::error_json(400, "time_seconds required for offline win");

        stats::Bucket b = stats::record_result(username, difficulty, mode, result, time_seconds);

        crow::json::wvalue out;
        out["username"] = username;
        out["difficulty"] = difficulty;
        out["mode"] = mode;
        out["bucket"] = stats::bucket_json(b);
        return crow::response(200, out);
    });

    CROW_ROUTE(app, "/api/stats/<string>/<int>")
    ([](const std::string& username, int difficulty)
    {
        if (username.empty())
            return stats::error_json(400, "username empty");
        if (!is_valid_difficulty(difficulty))
            return stats::error_json(400, "difficulty must be 1..5");

        auto rows = stats::fetch_user_diff(username, difficulty);
        auto json = stats::user_stats_json(username, rows);
        return crow::response(200, json);
    });

    CROW_ROUTE(app, "/api/stats/<string>")
    ([](const std::string& username)
    {
        if (username.empty())
            return stats::error_json(400, "username empty");

        auto rows = stats::fetch_user(username);
        auto json = stats::user_stats_json(username, rows);
        return crow::response(200, json);
    });

    app.port(8090).multithreaded().run();
    return 0;
}
