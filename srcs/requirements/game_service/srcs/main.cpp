#include "asio.hpp"
#include "crow_all.h"
#include <pqxx/pqxx>
#include <iostream>
#include <array>
#include "includes.hpp" 

std::array<std::array<int, 9>, 9> global_solution;

int main()
{
    init_game_db();
    crow::SimpleApp app;

    CROW_ROUTE(app, "/start").methods(crow::HTTPMethod::POST)
    ([&](const crow::request& req)
    {
        auto x = crow::json::load(req.body);
        if (!x)
            return crow::response(400, "Invalid JSON format");

        int difficulty = 1;
        if (x.has("difficulty"))
            difficulty = x["difficulty"].i();
    
        std::array<std::array<int, 9>, 9> local_puzzle;
        SolverStats stats;

        game_generator(local_puzzle, global_solution, difficulty, stats);

        crow::json::wvalue response;
        for (int i = 0; i < 9; ++i)
            for (int j = 0; j < 9; ++j)
                response["grid"][i][j] = local_puzzle[i][j];

        return crow::response(response);
    });

    CROW_ROUTE(app, "/move").methods(crow::HTTPMethod::POST)
    ([&](const crow::request& req)
    {
        auto x = crow::json::load(req.body);
        if (!x)
            return crow::response(400);

        int r = x["row"].i();
        int c = x["col"].i();
        int val = x["value"].i();

        bool is_correct = (val == 0) ? true : (global_solution[r][c] == val);
        
        crow::json::wvalue res;
        res["correct"] = is_correct;
        return crow::response(res);
    });

    CROW_ROUTE(app, "/api/record-game").methods(crow::HTTPMethod::POST)
    ([](const crow::request& req)
    {
        auto x = crow::json::load(req.body);
        if (!x)
            return crow::response(400, "Invalid JSON");

        int user_id = x["userId"].i();
        std::string mode = x["mode"].s();
        std::string result = x["result"].s();
        bool is_win = (result == "win");

        update_stats(user_id, mode, is_win);
        update_stats(user_id, "Total", is_win);

        return crow::response(200, "Stats updated");
    });

    CROW_ROUTE(app, "/api/leaderboard/<string>").methods(crow::HTTPMethod::GET)
    ([](std::string mode)
    {
        try
        {
            pqxx::connection* C = create_connection();
            if (!C)
                return crow::response(500, "DB Connection Failed");

            pqxx::nontransaction N(*C);
            std::string sql = "SELECT user_id, wins, games_played, COALESCE(username, 'User #' || user_id) "
                              "FROM player_stats WHERE mode = '" + N.esc(mode) + "' "
                              "ORDER BY wins DESC LIMIT 10";
            pqxx::result R = N.exec(sql);

            crow::json::wvalue result;
            int i = 0;
            for (auto row : R)
            {
                result[i]["userId"] = row[0].as<int>();
                result[i]["wins"] = row[1].as<int>();
                result[i]["games"] = row[2].as<int>();
                result[i]["username"] = row[3].as<std::string>();
                i++;
            }
            delete C;
            return crow::response(result);
        }
        catch (std::exception &e)
        {
            return crow::response(500, e.what());
        }
    });

    app.port(8080).multithreaded().run();
}