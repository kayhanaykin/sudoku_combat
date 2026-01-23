import { Controller, Get, Post, Body, Query, Param } from '@nestjs/common';

@Controller()
export class SudokuController
{
	@Get('sudoku/new-game')
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

	@Post('sudoku/check-move')
	async checkMove(@Body() body: { row: number; col: number; value: number })
	{
		try
		{
			const response = await fetch(`http://game_service:8080/api/check-move`,
				{ method: 'POST', headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body) });
			const result = await response.json();
			return { correct: result.correct };
		}
		catch (error)
		{
			console.error('cpp_backend error:', error);
			return { correct: false };
		}
	}

	//---------------------------------------------------------------------------------------
	@Post('battle/room/create')
	async createRoom(@Body() body: { roomName: string; creatorId: string, level: string })
	{}

	@Post('battle/room/join')
	async joinRoom(@Body() body: { roomId: string; playerId: string; spectator?: boolean })
	{}

	@Post('battle/room/leave')
	async leaveRoom(@Body() body: { roomId: string; playerId: string })
	{}

	@Get('battle/room/rooms')
	async getRooms(@Query('level') level?: string )
	{}

	//--------------------------------------------------------------------------------------
	//-------------------------------------------
	@Post('user/auth/register')
	async register()
	{}

	@Post('user/auth/login')
	async login()
	{}

	@Post('user/auth/logout')
	async logout()
	{}

	@Post('user/auth/refresh-token')
	async refreshToken()
	{}

	//-------------------------------------------
	@Get('user/profile/stats/:playerId')
	async getStats(@Param('playerId') playerId: string)
	{}

	@Get('user/profile/avatar/:playerId')
	async getAvatar(@Param('playerId') playerId: string)//...
	{}

	@Get('user/profile/history/:playerId')
	async getHistory(@Param('playerId') playerId: string)
	{}

	//-------------------------------------------
	@Post('user/profile/stats/:playerId')
	async updateStats(@Param('playerId') playerId: string,
		@Body() body: {})//...
	{}

	@Post('user/profile/avatar/:playerId')
	async updateAvatar(@Param('playerId') playerId: string)//...
	{}

	@Post('user/profile/history/:playerId')
	async updateHistory(@Param('playerId') playerId: string,
		@Body() body: {})//...
	{}
}
