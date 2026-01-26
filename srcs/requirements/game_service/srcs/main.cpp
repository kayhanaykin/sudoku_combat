// #include "includes.hpp"

// int	main()
// {
// 	// tester();
// 	std::array<std::array<int, 9>, 9> grid;
// 	std::array<std::array<int, 9>, 9> grid_solved;
// 	SolverStats stats;
// 	int hardness;

// 	std::cout << "Please Enter Hardness 1(EASY) to 5(EXTREME): ";
// 	scanf("%d", &hardness);
// 	game_generator(grid, grid_solved, hardness, stats);
// 	print_grid(grid);
// 	analyse_grid(stats, grid);
// 	print_stats(stats);
// 	play(grid, grid_solved);
// 	return 0;
// }

#include "asio.hpp"
#include "crow_all.h"
#include "includes.hpp"

// 1. Define outside (Global scope)
// This is just the "bucket" that holds the data
std::array<std::array<int, 9>, 9> global_solution;

int main() {
    crow::SimpleApp app;

    CROW_ROUTE(app, "/start").methods(crow::HTTPMethod::POST)
    ([&](const crow::request& req)
    {
        auto x = crow::json::load(req.body);
        
        // Eğer JSON hatalıysa 400 Bad Request dön
        if (!x) return crow::response(400, "Invalid JSON format");

        // 4. Zorluk derecesini al (Varsayılan: 1)
        int difficulty = 1;
        if (x.has("difficulty"))
            difficulty = x["difficulty"].i();
    
        // 2. Define the PUZZLE grid locally so it's fresh
        std::array<std::array<int, 9>, 9> local_puzzle;
        SolverStats stats;

        // 3. This call OVERWRITES the global_solution with the new answer
        // and fills local_puzzle with the new holes.
        game_generator(local_puzzle, global_solution, difficulty, stats);

        crow::json::wvalue response;
        for (int i = 0; i < 9; ++i)
            for (int j = 0; j < 9; ++j)
                response["grid"][i][j] = local_puzzle[i][j];

        return crow::response(response);
    });

    CROW_ROUTE(app, "/move").methods(crow::HTTPMethod::POST)
    ([&](const crow::request& req) {
        auto x = crow::json::load(req.body);
        if (!x) return crow::response(400);

        int r = x["row"].i();
        int c = x["col"].i();
        int val = x["value"].i();

        bool is_correct = (val == 0) ? true : (global_solution[r][c] == val);
        
        crow::json::wvalue res;
        res["correct"] = is_correct;
        return crow::response(res);
    });

    app.port(8080).multithreaded().run();
}