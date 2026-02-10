#pragma once

#include "includes.hpp"
#include "db.hpp"

namespace stats
{
    struct Bucket
    {
        int wins;
        int losses;
        std::optional<int> best_time_seconds;
    };

    Bucket record_result(const std::string& username,
                         int difficulty,
                         const std::string& mode,
                         const std::string& result,
                         std::optional<int> time_seconds);

    std::vector<std::tuple<int, std::string, Bucket>> fetch_user(const std::string& username);
    std::vector<std::tuple<int, std::string, Bucket>> fetch_user_diff(const std::string& username, int difficulty);
}
