#include "includes.hpp"

void	count_solutions(std::array<std::array<int, 9>, 9>& grid, int& count) 
{
    if (count > 1) 
		return; // Optimization: Stop if we already found more than one

    int row, col;
	bool result;

	result = find_empty_location(grid, row, col);
    if (result == false) // genellikle buraya girmiyor
	{
        count++; // Found a valid solution
        return;
    }

    for (int num = 1; num <= 9; num++) 
	{
        if (basic_check(grid, row, col, num)) 
		{
            grid[row][col] = num;
			std::cout << "row, col: " << row <<", " << col << " num: " << num 
			<< " count: " << count << std::endl;
            count_solutions(grid, count);
			print_sudoku(grid);
            grid[row][col] = 0; // Backtrack
        }
    }
}

// 20 free cells, count = 0, 1st empty cell --> row = 3, col = 5, filled
// 19 free cells, count = 0, 2nd empty cell --> row = 3, col = 6, filled
//...
// 01 free cells, count = 0; 20th empt cell --> ..., filled
// no free cells, count = 1; 
8 5 7 | 2 4 9 | 3 6 1 
2 9 4 | 6 1 3 | 8 5 7
6 3 1 | 5 8 7 | 2 9 4 
------+-------+------
5 8 9 | 4 7 1 | 6 2 3
7 6 3 | 8 5 2 | 1 4 9
1 4 2 | 3 9 6 | 7 8 5
------+-------+------
9 7 6 | 1 2 5 | 4 3 8
3 1 8 | 9 6 4 | 5 7 2
4 2 5 | 7 3 8 | 9 1 6


. . . | . . . | . . .
2 9 4 | 6 1 3 | 8 5 7
6 3 1 | 5 8 7 | 2 9 4
------+-------+------
5 8 9 | 4 7 1 | 6 2 3
7 . . | . 5 2 | . . . 
1 4 2 | 3 9 6 | 7 8 5
------+-------+------
9 7 6 | 1 2 5 | 4 3 8
3 1 8 | 9 6 4 | 5 7 2
4 2 5 | 7 3 8 | . . .