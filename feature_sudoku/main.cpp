#include "includes.hpp"

int	main()
{
	// tester();
	std::array<std::array<int, 9>, 9> grid;
	std::array<std::array<int, 9>, 9> grid_solved;
	SolverStats stats;
	int hardness;

	std::cout << "Please Enter Hardness 1(EASY) to 5(EXTREME): ";
	scanf("%d", &hardness);
	game_generator(grid, grid_solved, hardness, stats);
	print_grid(grid);
	analyse_grid(stats, grid);
	print_stats(stats);
	play(grid, grid_solved);
	return 0;
}