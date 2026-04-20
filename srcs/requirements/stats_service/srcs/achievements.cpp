#include "achievements.hpp"
#include "achievement_defs.hpp"
#include "repository.hpp"
#include <iostream>
namespace stats
{
    std::vector<AchievementCheck> AchievementChecker::check_achievements(
        long long user_id,
        const std::string &username,
        int difficulty,
        const std::string &mode,
        const std::string &result,
        std::optional<int> time_sec)
    {
        std::vector<AchievementCheck> achievements;
        if (result != "win")
            return achievements;
        if (mode == "online")
        {
            bool is_first_online_win = check_first_win_online(user_id);
            if (is_first_online_win)
            {
                achievements.push_back({"first_win_online", true, user_id, username});
            }
        }
        if (time_sec.has_value())
        {
            bool is_speedster = check_speedster(difficulty, time_sec);
            if (is_speedster)
            {
                const AchievementDefinition *speedster_def = get_speedster_definition_for_difficulty(difficulty);
                if (speedster_def)
                    achievements.push_back({speedster_def->type, true, user_id, username});
            }
        }
        if (mode == "online")
        {
            int current_streak = get_current_streak(user_id);
            if (current_streak >= ON_FIRE_5X)
                achievements.push_back({"on_fire_5x", true, user_id, username});
            if (current_streak >= ON_FIRE_10X)
                achievements.push_back({"on_fire_10x", true, user_id, username});
            if (current_streak >= ON_FIRE_25X)
                achievements.push_back({"on_fire_25x", true, user_id, username});
        }
        if (mode == "offline")
        {
            bool offline_graduate = check_graduate(user_id, "offline");
            if (offline_graduate)
            {
                achievements.push_back({"graduate_offline", true, user_id, username});
            }
        }
        if (mode == "online")
        {
            bool online_graduate = check_graduate(user_id, "online");
            if (online_graduate)
            {
                achievements.push_back({"graduate_online", true, user_id, username});
            }
        }
        bool is_star = check_star_leaderboard(user_id);
        if (is_star)
            achievements.push_back({"star", true, user_id, username});
        bool is_king = check_king(user_id, difficulty);
        if (is_king)
        {
            const AchievementDefinition *king_def = get_king_definition_for_difficulty(difficulty);
            if (king_def)
                achievements.push_back({king_def->type, true, user_id, username});
        }
        return achievements;
    }
    bool AchievementChecker::check_first_win_online(long long user_id)
    {
        try
        {
            pqxx::work tx(conn);
            pqxx::result res = tx.exec_params(
                "SELECT SUM(wins) FROM player_stats WHERE user_id=$1 AND mode='online'",
                user_id);
            tx.commit();
            if (!res.empty() && !res[0][0].is_null())
            {
                int total_wins = res[0][0].as<int>();
                return total_wins >= 1;
            }
            return false;
        }
        catch (const std::exception &e)
        {
            std::cerr << "Error checking first win: " << e.what() << std::endl;
            return false;
        }
    }
    bool AchievementChecker::check_speedster(int difficulty, std::optional<int> time_sec)
    {
        if (!time_sec.has_value())
            return false;
        int player_time = time_sec.value();
        if (difficulty == 1)
            return player_time < SPEEDSTER_EASY;
        if (difficulty == 2)
            return player_time < SPEEDSTER_MEDIUM;
        if (difficulty == 3)
            return player_time < SPEEDSTER_HARD;
        if (difficulty == 4)
            return player_time < SPEEDSTER_EXPERT;
        if (difficulty == 5)
            return player_time < SPEEDSTER_EXTREME;
        return false;
    }
    bool AchievementChecker::check_graduate(long long user_id, const std::string &mode)
    {
        try
        {
            pqxx::work tx(conn);
            pqxx::result res = tx.exec_params(
                "SELECT difficulty, SUM(wins) as total_wins "
                "FROM player_stats "
                "WHERE user_id=$1 AND mode=$2 "
                "GROUP BY difficulty",
                user_id, mode);
            tx.commit();
            bool has_easy = false;
            bool has_medium = false;
            bool has_hard = false;
            bool has_expert = false;
            bool has_extreme = false;
            for (const auto &row : res)
            {
                int diff = row[0].as<int>();
                int wins = row[1].as<int>();
                if (wins >= GRADUATE_MIN_WINS)
                {
                    if (diff == 1)
                        has_easy = true;
                    else if (diff == 2)
                        has_medium = true;
                    else if (diff == 3)
                        has_hard = true;
                    else if (diff == 4)
                        has_expert = true;
                    else if (diff == 5)
                        has_extreme = true;
                }
            }
            return has_easy && has_medium && has_hard && has_expert && has_extreme;
        }
        catch (const std::exception &e)
        {
            std::cerr << "Error checking graduate: " << e.what() << std::endl;
            return false;
        }
    }
    int AchievementChecker::get_current_streak(long long user_id)
    {
        try
        {
            pqxx::work tx(conn);
            pqxx::result streak_res = tx.exec_params(
                "SELECT current_streak FROM online_win_streaks WHERE user_id=$1",
                user_id);
            if (!streak_res.empty() && !streak_res[0][0].is_null())
            {
                int streak = streak_res[0][0].as<int>();
                tx.commit();
                return streak;
            }
            pqxx::result res = tx.exec_params(
                "SELECT result FROM match_history "
                "WHERE user_id=$1 AND mode='online' "
                "ORDER BY played_at DESC, id DESC",
                user_id);
            tx.commit();
            int streak = 0;
            for (const auto &row : res)
            {
                std::string result = row[0].as<std::string>();
                if (result == "win")
                    streak++;
                else
                    break;
            }
            return streak;
        }
        catch (const std::exception &e)
        {
            std::cerr << "Error getting streak: " << e.what() << std::endl;
            return 0;
        }
    }
    bool AchievementChecker::check_star_leaderboard(long long user_id)
    {
        try
        {
            std::optional<int> rank = get_user_leaderboard_rank(user_id, std::nullopt, false);
            return rank.has_value() && rank.value() <= 50;
        }
        catch (const std::exception &e)
        {
            std::cerr << "Error checking leaderboard: " << e.what() << std::endl;
            return false;
        }
    }
    bool AchievementChecker::check_king(long long user_id, int difficulty)
    {
        try
        {
            std::optional<int> rank = get_user_leaderboard_rank(user_id, difficulty, false);
            return rank.has_value() && rank.value() == 1;
        }
        catch (const std::exception &e)
        {
            std::cerr << "Error checking king: " << e.what() << std::endl;
            return false;
        }
    }
}
