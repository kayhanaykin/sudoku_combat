#pragma once

#include "array"
#include "vector"
#include <algorithm>    // std::random_shuffle
#include <iostream>		// std::cout
#include <ctime>        // std::time

//random_full_grid_gen.cpp
void	sudoku_generator(std::array<std::array<int, 9>, 9>&);
void	fill_diagonal_boxes(std::array<std::array<int, 9>, 9>&);
void	print_sudoku(std::array<std::array<int, 9>, 9>&);
bool 	fill_other_boxes(std::array<std::array<int, 9>, 9>&, int, int);
bool	basic_check(const std::array<std::array<int, 9>, 9>& grid, int row, int col, int num);
bool	find_empty_location(const std::array<std::array<int, 9>, 9>& grid, int& row, int& col);
void	game_generator(std::array<std::array<int, 9>, 9>&);

//game_grid_gen.cpp

void	count_solutions(std::array<std::array<int, 9>, 9>& grid, int& count);

//utils.cpp