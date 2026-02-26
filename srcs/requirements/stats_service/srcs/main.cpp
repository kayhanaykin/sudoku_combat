#include "includes.hpp"
#include "db.hpp"
#include "repository.hpp"
#include "json_utils.hpp"

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

        if (!body.has("username") || !body.has("difficulty")
            || !body.has("mode") || !body.has("result"))
            return stats::make_error(400, "missing fields");

        std::string username = body["username"].s();
        int         diff     = body["difficulty"].i();
        std::string mode     = body["mode"].s();
        std::string result   = body["result"].s();

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

        stats::Bucket b = stats::record_result(username, diff, mode, result, time_sec);

        crow::json::wvalue out;
        out["username"]   = username;
        out["difficulty"] = diff;
        out["mode"]       = mode;
        out["bucket"]     = stats::bucket_to_json(b);
        return crow::response(200, out);
    });

    CROW_ROUTE(app, "/api/stats/<string>/<int>")
    ([](const std::string &username, int diff)
    {
        if (username.empty())
            return stats::make_error(400, "username empty");
        if (!valid_diff(diff))
            return stats::make_error(400, "difficulty must be 1..5");

        auto rows = stats::get_user_diff_stats(username, diff);
        return crow::response(200, stats::stats_to_json(username, rows));
    });

    CROW_ROUTE(app, "/api/stats/<string>")
    ([](const std::string &username)
    {
        if (username.empty())
            return stats::make_error(400, "username empty");

        auto rows = stats::get_user_stats(username);
        return crow::response(200, stats::stats_to_json(username, rows));
    });

    app.port(8090).multithreaded().run();
    return 0;
}
