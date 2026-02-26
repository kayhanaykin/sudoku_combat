#pragma once

#include "includes.hpp"
#include "db.hpp"

namespace stats
{
    struct Bucket
    {
        int wins;
        int losses;
        std::optional<int> best_time;
    };

    struct StatsRow
    {
        int         difficulty;
        std::string mode;
        Bucket      bucket;
    };

    Bucket record_result(const std::string &username,
                         int difficulty,
                         const std::string &mode,
                         const std::string &result,
                         std::optional<int> time_sec);

    std::vector<StatsRow> get_user_stats(const std::string &username);
    std::vector<StatsRow> get_user_diff_stats(const std::string &username, int difficulty);
}
