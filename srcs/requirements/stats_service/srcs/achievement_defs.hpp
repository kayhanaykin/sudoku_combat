#pragma once
#include "includes.hpp"
namespace stats
{
    struct AchievementDefinition
    {
        std::string type;
        std::string name;
        std::string icon;
        std::string description;
        int target;
    };
    const std::vector<AchievementDefinition> &get_all_achievement_definitions();
    const AchievementDefinition *find_achievement_definition(const std::string &type);
    const AchievementDefinition *get_speedster_definition_for_difficulty(int difficulty);
    const AchievementDefinition *get_king_definition_for_difficulty(int difficulty);
}
