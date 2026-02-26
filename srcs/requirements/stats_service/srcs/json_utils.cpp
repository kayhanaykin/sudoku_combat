#include "json_utils.hpp"

namespace stats
{
    static double calc_winrate(int wins, int losses)
    {
        int total = wins + losses;
        if (total == 0)
            return 0.0;
        return (double)wins / (double)total;
    }

    crow::json::wvalue bucket_to_json(const Bucket &b)
    {
        crow::json::wvalue j;
        j["wins"]    = b.wins;
        j["losses"]  = b.losses;
        j["winrate"] = calc_winrate(b.wins, b.losses);

        if (b.best_time.has_value())
            j["best_time_seconds"] = b.best_time.value();
        else
            j["best_time_seconds"] = nullptr;
        return j;
    }

    crow::json::wvalue stats_to_json(const std::string &username,
                                     const std::vector<StatsRow> &rows)
    {
        crow::json::wvalue root;
        root["username"] = username;

        crow::json::wvalue diffs;
        for (const StatsRow &sr : rows)
        {
            std::string key = std::to_string(sr.difficulty);
            diffs[key][sr.mode] = bucket_to_json(sr.bucket);
        }

        root["difficulties"] = std::move(diffs);
        return root;
    }

    crow::response make_error(int code, const std::string &msg)
    {
        crow::json::wvalue j;
        j["error"] = msg;
        return crow::response(code, j);
    }
}
