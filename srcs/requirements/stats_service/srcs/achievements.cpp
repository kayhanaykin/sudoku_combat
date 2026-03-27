#include "achievements.hpp"
#include <iostream>

namespace stats
{
    std::vector<AchievementCheck> AchievementChecker::check_achievements(
        const std::string &username,
        int difficulty,
        const std::string &mode,
        const std::string &result,
        std::optional<int> time_sec)
    {
        std::vector<AchievementCheck> achievements;

        // Only check for wins
        if (result != "win")
            return achievements;

        // 1) First Win (sadece online)
        if (mode == "online")
        {
            bool is_first_online_win = check_first_win_online(username);
            if (is_first_online_win)
            {
                achievements.push_back({"first_win_online", true, username});
            }
        }

        // 2) Speedster (süreye bağlı)
        if (time_sec.has_value())
        {
            bool is_speedster = check_speedster(difficulty, time_sec);
            if (is_speedster)
            {
                if (difficulty == 1)
                    achievements.push_back({"speedster_easy", true, username});
                else if (difficulty == 2)
                    achievements.push_back({"speedster_medium", true, username});
                else if (difficulty == 3)
                    achievements.push_back({"speedster_hard", true, username});
                else if (difficulty == 4)
                    achievements.push_back({"speedster_expert", true, username});
                else if (difficulty == 5)
                    achievements.push_back({"speedster_extreme", true, username});
            }
        }

        // 3) On Fire serisi (sadece online)
        if (mode == "online")
        {
            int current_streak = get_current_streak(username);
            
            if (current_streak >= ON_FIRE_25X)
                achievements.push_back({"on_fire_25x", true, username});
            else if (current_streak >= ON_FIRE_10X)
                achievements.push_back({"on_fire_10x", true, username});
            else if (current_streak >= ON_FIRE_5X)
                achievements.push_back({"on_fire_5x", true, username});
        }

        // 4) Graduate (tüm zorluklarda 20+ win)
        if (mode == "offline")
        {
            bool offline_graduate = check_graduate(username, "offline");
            if (offline_graduate)
            {
                achievements.push_back({"graduate_offline", true, username});
            }
        }

        if (mode == "online")
        {
            bool online_graduate = check_graduate(username, "online");
            if (online_graduate)
            {
                achievements.push_back({"graduate_online", true, username});
            }
        }

        // 5) Star (ilk 100'e girdiyse)
        bool is_star = check_star_leaderboard(username);
        if (is_star)
            achievements.push_back({"star", true, username});

        // 6) King (o zorlukta #1)
        bool is_king = check_king(username, difficulty);
        if (is_king)
        {
            if (difficulty == 1)
                achievements.push_back({"king_easy", true, username});
            else if (difficulty == 2)
                achievements.push_back({"king_medium", true, username});
            else if (difficulty == 3)
                achievements.push_back({"king_hard", true, username});
            else if (difficulty == 4)
                achievements.push_back({"king_expert", true, username});
            else if (difficulty == 5)
                achievements.push_back({"king_extreme", true, username});
        }

        return achievements;
    }

    bool AchievementChecker::check_first_win_online(const std::string &username)
    {
        try
        {
            pqxx::work tx(conn);
            pqxx::result res = tx.exec_params(
                "SELECT SUM(wins) FROM player_stats WHERE username=$1 AND mode='online'",
                username);
            tx.commit();

            if (!res.empty() && !res[0][0].is_null())
            {
                int total_wins = res[0][0].as<int>();
                return total_wins == 1; // First win
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

    bool AchievementChecker::check_graduate(const std::string &username, const std::string &mode)
    {
        try
        {
            pqxx::work tx(conn);
            
            // Check if has 20+ wins in ALL difficulties
            pqxx::result res = tx.exec_params(
                "SELECT difficulty, SUM(wins) as total_wins "
                "FROM player_stats "
                "WHERE username=$1 AND mode=$2 "
                "GROUP BY difficulty",
                username, mode);
            
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

            // Tüm zorluklar tamamlanmalı
            return has_easy && has_medium && has_hard && has_expert && has_extreme;
        }
        catch (const std::exception &e)
        {
            std::cerr << "Error checking graduate: " << e.what() << std::endl;
            return false;
        }
    }

    int AchievementChecker::get_current_streak(const std::string &username)
    {
        try
        {
            pqxx::work tx(conn);
            
            // Get last 100 games, count consecutive wins from most recent
            pqxx::result res = tx.exec_params(
                "SELECT result FROM match_history "
                "WHERE username=$1 AND mode='online' "
                "ORDER BY played_at DESC "
                "LIMIT 100",
                username);
            
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

    bool AchievementChecker::check_star_leaderboard(const std::string &username)
    {
        try
        {
            pqxx::work tx(conn);
            
            // Check if user appears in top 100 of any difficulty leaderboard
            pqxx::result res = tx.exec_params(
                "SELECT COUNT(*) FROM ("
                "  SELECT username, SUM(wins) as total_wins FROM player_stats "
                "  WHERE mode='online' GROUP BY username "
                "  ORDER BY total_wins DESC LIMIT 100"
                ") AS top_100 WHERE username=$1",
                username);
            
            tx.commit();

            return res[0][0].as<int>() > 0;
        }
        catch (const std::exception &e)
        {
            std::cerr << "Error checking leaderboard: " << e.what() << std::endl;
            return false;
        }
    }

    bool AchievementChecker::check_king(const std::string &username, int difficulty)
    {
        try
        {
            pqxx::work tx(conn);
            
            // Check if user is rank #1 in this difficulty
            pqxx::result res = tx.exec_params(
                "SELECT username FROM ("
                "  SELECT username, SUM(wins) as total_wins FROM player_stats "
                "  WHERE difficulty=$1 AND mode='online' "
                "  GROUP BY username ORDER BY total_wins DESC LIMIT 1"
                ") AS top_player WHERE username=$2",
                difficulty, username);
            
            tx.commit();

            return !res.empty();
        }
        catch (const std::exception &e)
        {
            std::cerr << "Error checking king: " << e.what() << std::endl;
            return false;
        }
    }
}
