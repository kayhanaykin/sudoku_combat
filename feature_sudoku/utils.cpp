#include "includes.hpp"

void	print_sudoku(std::array<std::array<int, 9>, 9>& grid) 
{
    std::string line_separator = "------+-------+------";

    for (int i = 0; i < 9; ++i) {
        // Her 3 satırda bir yatay ayırıcı çizgi çek
        if (i > 0 && i % 3 == 0) {
            std::cout << line_separator << std::endl;
        }

        for (int j = 0; j < 9; ++j) {
            // Her 3 sütunda bir dikey ayırıcı çizgi çek
            if (j > 0 && j % 3 == 0) {
                std::cout << "| ";
            }

            if (grid[i][j] == 0) {
                std::cout << ". ";
            } else {
                std::cout << grid[i][j] << " ";
            }
        }
        std::cout << std::endl;
    }
	std::cout << std::endl;
}

bool	find_empty_location(const std::array<std::array<int, 9>, 9>& grid, int& row, int& col) 
{
    for (row = 0; row < 9; row++)
        for (col = 0; col < 9; col++)
            if (grid[row][col] == 0) 
                return true;
    return false;
}

bool	basic_check(const std::array<std::array<int, 9>, 9>& grid, int row, int col, int num) 
{
	// Check 3x3 box
    int start_row = row - row % 3;
	int start_col = col - col % 3;
	
    for (int i = 0; i < 3; ++i) 
		for (int j = 0; j < 3; ++j) 
			if (grid[i + start_row][j + start_col] == num) 
				return false;
	// Check row and column
	for (int i = 0; i < 9; ++i) 
		if (grid[row][i] == num || grid[i][col] == num) 
			return false;
	return true;
}