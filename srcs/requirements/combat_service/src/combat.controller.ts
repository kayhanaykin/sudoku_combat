import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Room } from './room.entity';

@Controller('api/play')
export class CombatController
{
	constructor( @InjectRepository(Room)
		private roomRepository: Repository<Room> )
	{}

	@Post('start/offline')
	async startOffline(@Body() body: { difficulty: string })
	{
		try
		{
			const response = await fetch(`http://game_service:8080/generate?difficulty=${body.difficulty}`);
			if (!response.ok)
				throw new Error('Failed to fetch from game_service');
			const gameData = await response.json();
			const newRoom = this.roomRepository.create(
			{
				ownerId: 'offline',
				ownerName: 'Offline Player',
				difficulty: body.difficulty,
				currBoard: gameData.board,
				solvedBoard: gameData.solution,
				health: [3, 3],
				status: 'playing'
			});
			const savedRoom = await this.roomRepository.save(newRoom);
			return {
				success: true,
				gameId: savedRoom.id,
				board: gameData.board,
				lives: 3
			};
		}
		catch (error)
		{
			throw new HttpException('Game Engine unreachable', HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	@Post('start/online')
	async startOnline(@Body() body: { userId: string, difficulty: string, ownerName: string })
	{
		if (!body.userId || !body.difficulty)
			throw new HttpException('Missing required fields', HttpStatus.BAD_REQUEST);
		try
		{
			const response = await fetch(`http://game_service:8080/generate?difficulty=${body.difficulty}`);
			if (!response.ok)
				throw new Error('Failed to fetch from game_service');
			const gameData = await response.json();
			const newRoom = this.roomRepository.create(
			{
				ownerId: body.userId,
				ownerName: body.ownerName || 'Unknown Player',
				difficulty: body.difficulty,
				currBoard: gameData.board,
				solvedBoard: gameData.solution,
				health: [3, 3],
				status: 'waiting'
			});
			const savedRoom = await this.roomRepository.save(newRoom);
			return {
				success: true,
				roomId: savedRoom.id
			};
		}
		catch (error)
		{
			throw new HttpException('Game Engine unreachable or Database Error', HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	@Post('move')
	async handleOfflineMove(@Body() body: { gameId: number, row: number, col: number, value: number })
	{
		if (!body.gameId)
			throw new HttpException('Missing gameId', HttpStatus.BAD_REQUEST);
		const room = await this.roomRepository.findOne({ where: { id: body.gameId } });
		if (!room)
			throw new HttpException('Game not found', HttpStatus.NOT_FOUND);
		const isCorrect = room.solvedBoard[body.row][body.col] === body.value;
		if (isCorrect)
		{
			const newBoard = JSON.parse(JSON.stringify(room.currBoard));
			newBoard[body.row][body.col] = body.value;
			room.currBoard = newBoard;
			const isWin = !newBoard.some((row: number[]) => row.includes(0));
			await this.roomRepository.save(room);
			return {
				result: isWin ? 'WIN' : 'CORRECT',
				lives: room.health[0]
			};
		}
		else
		{
			room.health[0] -= 1;
			const livesLeft = room.health[0];
			await this.roomRepository.save(room);
			if (!livesLeft)
				return { result: 'GAME_OVER', lives: 0 };
			else
				return { result: 'WRONG', lives: livesLeft };
		}
	}
}
