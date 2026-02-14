#include "json_utils.hpp"

namespace stats
{
    static double winrate(int wins, int losses)
    {
        int total = wins + losses;
        if (total == 0)
            return 0.0;
        return static_cast<double>(wins) / static_cast<double>(total);
    }

    crow::json::wvalue bucket_json(const Bucket& b)
    {
        crow::json::wvalue out;
        out["wins"] = b.wins;
        out["losses"] = b.losses;
        out["winrate"] = winrate(b.wins, b.losses);

        if (b.best_time_seconds.has_value())
            out["best_time_seconds"] = b.best_time_seconds.value();
        else
            out["best_time_seconds"] = nullptr;

        return out;
    }

    crow::json::wvalue user_stats_json(const std::string& username,
                                       const std::vector<std::tuple<int, std::string, Bucket>>& rows)
    {
        crow::json::wvalue root;
        root["username"] = username;

        crow::json::wvalue diffs;

        for (const auto& it : rows)
        {
            int diff = std::get<0>(it);
            const std::string& mode = std::get<1>(it);
            const Bucket& b = std::get<2>(it);

            std::string k = std::to_string(diff);
            diffs[k][mode] = bucket_json(b);
        }

        root["difficulties"] = diffs;
        return root;
    }

    crow::response error_json(int code, const std::string& msg)
    {
        crow::json::wvalue err;
        err["error"] = msg;
        return crow::response(code, err);
    }
}
