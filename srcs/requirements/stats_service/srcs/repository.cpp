#include "repository.hpp"

namespace stats
{
    [[maybe_unused]] static double winrate(int wins, int losses)
    {
        int total = wins + losses;
        if (total == 0)
            return 0.0;
        return static_cast<double>(wins) / static_cast<double>(total);
    }

    Bucket record_result(const std::string& username,
                         int difficulty,
                         const std::string& mode,
                         const std::string& result,
                         std::optional<int> time_seconds)
    {
        sqlite3* db = open_db();
        if (!db)
            return Bucket{0, 0, std::nullopt};

        int wins_inc = (result == "win") ? 1 : 0;
        int losses_inc = (result == "lose") ? 1 : 0;

        std::optional<int> best = std::nullopt;
        if (mode == "offline" && result == "win")
            best = time_seconds;

        const char* upsert_sql =
            "INSERT INTO player_stats (username, difficulty, mode, wins, losses, best_time_seconds) "
            "VALUES (?, ?, ?, ?, ?, ?) "
            "ON CONFLICT(username, difficulty, mode) DO UPDATE SET "
            "wins = wins + excluded.wins, "
            "losses = losses + excluded.losses, "
            "best_time_seconds = CASE "
            "WHEN excluded.best_time_seconds IS NULL THEN player_stats.best_time_seconds "
            "WHEN player_stats.best_time_seconds IS NULL THEN excluded.best_time_seconds "
            "WHEN excluded.best_time_seconds < player_stats.best_time_seconds THEN excluded.best_time_seconds "
            "ELSE player_stats.best_time_seconds "
            "END, "
            "updated_at = datetime('now');";

        sqlite3_stmt* stmt = nullptr;
        if (sqlite3_prepare_v2(db, upsert_sql, -1, &stmt, nullptr) != SQLITE_OK)
        {
            close_db(db);
            return Bucket{0, 0, std::nullopt};
        }

        sqlite3_bind_text(stmt, 1, username.c_str(), -1, SQLITE_TRANSIENT);
        sqlite3_bind_int(stmt, 2, difficulty);
        sqlite3_bind_text(stmt, 3, mode.c_str(), -1, SQLITE_TRANSIENT);
        sqlite3_bind_int(stmt, 4, wins_inc);
        sqlite3_bind_int(stmt, 5, losses_inc);

        if (best.has_value())
            sqlite3_bind_int(stmt, 6, best.value());
        else
            sqlite3_bind_null(stmt, 6);

        sqlite3_step(stmt);
        sqlite3_finalize(stmt);

        const char* select_sql =
            "SELECT wins, losses, best_time_seconds "
            "FROM player_stats "
            "WHERE username = ? AND difficulty = ? AND mode = ?;";

        sqlite3_stmt* sel = nullptr;
        Bucket out{0, 0, std::nullopt};

        if (sqlite3_prepare_v2(db, select_sql, -1, &sel, nullptr) == SQLITE_OK)
        {
            sqlite3_bind_text(sel, 1, username.c_str(), -1, SQLITE_TRANSIENT);
            sqlite3_bind_int(sel, 2, difficulty);
            sqlite3_bind_text(sel, 3, mode.c_str(), -1, SQLITE_TRANSIENT);

            if (sqlite3_step(sel) == SQLITE_ROW)
            {
                out.wins = sqlite3_column_int(sel, 0);
                out.losses = sqlite3_column_int(sel, 1);

                if (sqlite3_column_type(sel, 2) != SQLITE_NULL)
                    out.best_time_seconds = sqlite3_column_int(sel, 2);
            }
            sqlite3_finalize(sel);
        }

        close_db(db);
        return out;
    }

    static std::vector<std::tuple<int, std::string, Bucket>> fetch_internal(sqlite3* db,
                                                                            const std::string& sql,
                                                                            const std::string& username,
                                                                            std::optional<int> difficulty)
    {
        sqlite3_stmt* stmt = nullptr;
        std::vector<std::tuple<int, std::string, Bucket>> rows;

        if (sqlite3_prepare_v2(db, sql.c_str(), -1, &stmt, nullptr) != SQLITE_OK)
            return rows;

        sqlite3_bind_text(stmt, 1, username.c_str(), -1, SQLITE_TRANSIENT);

        if (difficulty.has_value())
            sqlite3_bind_int(stmt, 2, difficulty.value());

        while (sqlite3_step(stmt) == SQLITE_ROW)
        {
            int diff = sqlite3_column_int(stmt, 0);
            const unsigned char* mode_text = sqlite3_column_text(stmt, 1);
            std::string mode = mode_text ? reinterpret_cast<const char*>(mode_text) : "";

            Bucket b{0, 0, std::nullopt};
            b.wins = sqlite3_column_int(stmt, 2);
            b.losses = sqlite3_column_int(stmt, 3);

            if (sqlite3_column_type(stmt, 4) != SQLITE_NULL)
                b.best_time_seconds = sqlite3_column_int(stmt, 4);

            rows.push_back(std::make_tuple(diff, mode, b));
        }

        sqlite3_finalize(stmt);
        return rows;
    }

    std::vector<std::tuple<int, std::string, Bucket>> fetch_user(const std::string& username)
    {
        sqlite3* db = open_db();
        if (!db)
            return {};

        std::string sql =
            "SELECT difficulty, mode, wins, losses, best_time_seconds "
            "FROM player_stats "
            "WHERE username = ? "
            "ORDER BY difficulty ASC, mode ASC;";

        auto rows = fetch_internal(db, sql, username, std::nullopt);
        close_db(db);
        return rows;
    }

    std::vector<std::tuple<int, std::string, Bucket>> fetch_user_diff(const std::string& username, int difficulty)
    {
        sqlite3* db = open_db();
        if (!db)
            return {};

        std::string sql =
            "SELECT difficulty, mode, wins, losses, best_time_seconds "
            "FROM player_stats "
            "WHERE username = ? AND difficulty = ? "
            "ORDER BY mode ASC;";

        auto rows = fetch_internal(db, sql, username, difficulty);
        close_db(db);
        return rows;
    }
}
