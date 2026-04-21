#include "achievement_defs.hpp"
namespace stats
{
    static const std::vector<AchievementDefinition> g_achievement_definitions = {
        {"first_win_online", "First Win", "🥇", "Unlocks when you win your first online match.", 1},
        {"speedster_easy", "Speedster I", "⚡", "Unlocks when you finish Easy in 2 minutes or less.", 1},
        {"speedster_medium", "Speedster II", "⚡", "Unlocks when you finish Medium in 4 minutes or less.", 1},
        {"speedster_hard", "Speedster III", "⚡", "Unlocks when you finish Hard in 6 minutes or less.", 1},
        {"speedster_expert", "Speedster IV", "⚡", "Unlocks when you finish Expert in 8 minutes or less.", 1},
        {"speedster_extreme", "Speedster V", "⚡", "Unlocks when you finish Extreme in 10 minutes or less.", 1},
        {"on_fire_5x", "Win Streak I", "🔥", "Unlocks when you reach a 5-win streak.", 5},
        {"on_fire_10x", "Win Streak II", "🔥", "Unlocks when you reach a 10-win streak.", 10},
        {"on_fire_25x", "Win Streak III", "🔥", "Unlocks when you reach a 25-win streak.", 25},
        {"graduate_offline", "Graduate Offline", "🎓", "Unlocks with 20+ wins in all difficulties in Offline mode.", 5},
        {"graduate_online", "Graduate Online", "🎓", "Unlocks with 20+ wins in all difficulties in Online mode.", 5},
        {"star", "Star", "⭐", "Unlocks when you enter Top 50 in the online leaderboard.", 1},
        {"king_easy", "King I", "👑", "Unlocks by reaching Rank #1 on Easy leaderboard.", 1},
        {"king_medium", "King II", "👑", "Unlocks by reaching Rank #1 on Medium leaderboard.", 1},
        {"king_hard", "King III", "👑", "Unlocks by reaching Rank #1 on Hard leaderboard.", 1},
        {"king_expert", "King IV", "👑", "Unlocks by reaching Rank #1 on Expert leaderboard.", 1},
        {"king_extreme", "King V", "👑", "Unlocks by reaching Rank #1 on Extreme leaderboard.", 1}
    };
    const std::vector<AchievementDefinition> &get_all_achievement_definitions()
    {
        return g_achievement_definitions;
    }
    const AchievementDefinition *find_achievement_definition(const std::string &type)
    {
        for (size_t i = 0; i < g_achievement_definitions.size(); ++i)
        {
            if (g_achievement_definitions[i].type == type)
                return &g_achievement_definitions[i];
        }
        return NULL;
    }
    const AchievementDefinition *get_speedster_definition_for_difficulty(int difficulty)
    {
        if (difficulty == 1)
            return find_achievement_definition("speedster_easy");
        if (difficulty == 2)
            return find_achievement_definition("speedster_medium");
        if (difficulty == 3)
            return find_achievement_definition("speedster_hard");
        if (difficulty == 4)
            return find_achievement_definition("speedster_expert");
        if (difficulty == 5)
            return find_achievement_definition("speedster_extreme");
        return NULL;
    }
    const AchievementDefinition *get_king_definition_for_difficulty(int difficulty)
    {
        if (difficulty == 1)
            return find_achievement_definition("king_easy");
        if (difficulty == 2)
            return find_achievement_definition("king_medium");
        if (difficulty == 3)
            return find_achievement_definition("king_hard");
        if (difficulty == 4)
            return find_achievement_definition("king_expert");
        if (difficulty == 5)
            return find_achievement_definition("king_extreme");
        return NULL;
    }
}
