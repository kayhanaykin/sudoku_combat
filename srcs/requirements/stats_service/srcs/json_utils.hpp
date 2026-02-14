#pragma once

#include "includes.hpp"
#include "repository.hpp"

namespace stats
{
    crow::json::wvalue bucket_json(const Bucket& b);
    crow::json::wvalue user_stats_json(
        const std::string& username,
        const std::vector<std::tuple<int, std::string, Bucket>>& rows);
    crow::response error_json(int code, const std::string& msg);
}
