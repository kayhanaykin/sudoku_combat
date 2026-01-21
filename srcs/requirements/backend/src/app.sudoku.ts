import { Controller, Get, Post, Body, Query } from '@nestjs/common';

@Controller()
export class SudokuController
{
	@Get('sudoku/off/new-game')
	async newGame(@Query('level') level: string)
	{
		try
		{
			const response = await fetch(`http://game_service:8080/api/new-game?level=${level}`);
			const data = await response.json();
			return data;
		}
		catch (error)
		{
			return { error: 'Failed to generate grid' };
		}
	}

	@Post('sudoku/off/check-move')
	async checkMove(@Body() body: { row: number; col: number; value: number })
	{
		try
		{
			const response = await fetch(`http://game_service:8080/api/check-move`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
			const result = await response.json();
			return { correct: result.correct };
		}
		catch (error)
		{
			console.error('cpp_backend error:', error);
			return { correct: false };
		}
	}
}
