#include "includes.hpp"

int	main()
{
	// tester();
	std::array<std::array<int, 9>, 9> grid;
	SolverStats stats;
	int hardness;

	std::cout << "Please Enter Hardness 1(EASY) to 5(EXTREME): ";
	scanf("%d", &hardness);
	game_generator(grid, hardness, stats);
	print_grid(grid);
	analyse_grid(stats, grid);
	print_stats(stats);
	return 0;
}