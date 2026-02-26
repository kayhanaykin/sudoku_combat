#pragma once

#include "includes.hpp"
#include "repository.hpp"

namespace stats
{
    crow::json::wvalue bucket_to_json(const Bucket &b);
    crow::json::wvalue stats_to_json(const std::string &username,
                                     const std::vector<StatsRow> &rows);
    crow::response     make_error(int code, const std::string &msg);
}
