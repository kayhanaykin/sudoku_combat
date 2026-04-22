import { Controller, Post, Body, Param } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Room } from './room.entity';

const ERROR = 
{
	USER_ID_REQUIRED: { success: false, message: 'userId is required' },
	ROOM_ID_REQUIRED: { success: false, message: 'roomId is required' },
	ROOM_NOT_FOUND: { success: false, message: 'Room not found' },
	DIFFICULTY_REQUIRED: { success: false, message: 'Difficulty is required' },
	INVALID_DIFFICULTY: { success: false, message: 'Difficulty must be between 1 and 5' },
	GAME_ENGINE_ERROR: {success: false, message: 'Game Engine unreachable'},
	DB_ERROR: (error: any) => ({ success: false, message: 'Database error', error: error.message })
};

@Controller('api/play')
export class CombatController
{
	constructor( @InjectRepository(Room)
		private roomRepository: Repository<Room> )
	{}

	@Post('start/offline')
	async	startOffline(@Body() body: { difficulty: string, userId?: string, ownerName?: string })
	{
		if (!body.difficulty)
			return ERROR.DIFFICULTY_REQUIRED;

		if (!['1', '2', '3', '4', '5'].includes(body.difficulty))
			return ERROR.INVALID_DIFFICULTY;
		try
		{
			if (body.userId)
			{
				await this.roomRepository
					.createQueryBuilder()
					.delete()
					.where('ownerId = :uid AND mode = :mode AND status = :status',
						{ uid: String(body.userId), mode: 'offline', status: 'playing' })
					.execute();
			}

			const response = await fetch(`http://game_service:8080/generate?difficulty=${body.difficulty}`);
			if (!response.ok)
				return ERROR.GAME_ENGINE_ERROR;
			const gameData = await response.json();
			const newRoom = this.roomRepository.create({
				ownerId: body.userId ? String(body.userId) : 'offline',
				ownerName: body.ownerName || 'Offline Player',
				difficulty: body.difficulty,
				currBoard: gameData.board,
				solvedBoard: gameData.solution,
				health: [3, 3],
				status: 'playing',
				mode: 'offline',
				gameStartTime: new Date()
			});
			const savedRoom = await this.roomRepository.save(newRoom);
			return {
				success: true,
				gameId: savedRoom.id,
				board: gameData.board,
				lives: 3,
				gameStartTime: savedRoom.gameStartTime
			};
		}
		catch (error)
		{
			return ERROR.DB_ERROR(error);
		}
	}

	@Post('start/online')
	async	startOnline(@Body() body: { userId: string, difficulty: string, ownerName: string })
	{
		if (!body.userId)
			return ERROR.USER_ID_REQUIRED;
		if (!body.difficulty)
			return ERROR.DIFFICULTY_REQUIRED;

		if (!['1', '2', '3', '4', '5'].includes(body.difficulty))
			return ERROR.INVALID_DIFFICULTY;
		try
		{
			const response = await fetch(`http://game_service:8080/generate?difficulty=${body.difficulty}`);
			if (!response.ok)
				return ERROR.GAME_ENGINE_ERROR;
			const gameData = await response.json();
			const newRoom = this.roomRepository.create(
			{
				ownerId: body.userId,
				ownerName: body.ownerName,
				difficulty: body.difficulty,
				currBoard: gameData.board,
				solvedBoard: gameData.solution,
				health: [3, 3],
				status: 'waiting'
			});
			const savedRoom = await this.roomRepository.save(newRoom);
			return { success: true, roomId: savedRoom.id };
		}
		catch (error)
		{
			return ERROR.DB_ERROR(error);
		}
	}

	@Post('abandon/:gameId')
	async	abandonOfflineGame(@Param('gameId') gameId: string)
	{
		if (!gameId)
			return ERROR.ROOM_ID_REQUIRED;
		try
		{
			const room = await this.roomRepository.findOne({ where: { id: Number(gameId) } });
			if (!room)
				return ERROR.ROOM_NOT_FOUND;
			room.status = 'finished';
			await this.roomRepository.save(room);
			return { success: true };
		}
		catch (error)
		{
			return ERROR.DB_ERROR(error);
		}
	}

	@Post('hint-used/:gameId')
	async	reportHintUsed(@Param('gameId') gameId: string)
	{
		if (!gameId)
			return ERROR.ROOM_ID_REQUIRED;
		try
		{
			const room = await this.roomRepository.findOne({ where: { id: Number(gameId) } });
			if (!room)
				return ERROR.ROOM_NOT_FOUND;
			room.hintsUsed = (room.hintsUsed || 0) + 1;
			await this.roomRepository.save(room);
			return { success: true, hintsUsed: room.hintsUsed };
		}
		catch (error)
		{
			return ERROR.DB_ERROR(error);
		}
	}

	@Post('move')
	async	handleOfflineMove(@Body() body: { gameId: number, row: number, col: number, value: number })
	{
		if (!body.gameId)
			return ERROR.ROOM_ID_REQUIRED;
		const room = await this.roomRepository.findOne({ where: { id: body.gameId } });
		if (!room)
			return ERROR.ROOM_NOT_FOUND;
		const isCorrect = room.solvedBoard[body.row][body.col] === body.value;
		if (isCorrect)
		{
			const newBoard = JSON.parse(JSON.stringify(room.currBoard));
			newBoard[body.row][body.col] = body.value;
			room.currBoard = newBoard;
			const isWin = !newBoard.some((row: number[]) => row.includes(0));

			if (isWin)
				room.status = 'finished';
			await this.roomRepository.save(room);
			return { result: isWin ? 'WIN' : 'CORRECT', lives: room.health[0] };
		}
		else
		{
			room.health = [room.health[0] - 1, room.health[1]];
			const livesLeft = room.health[0];
			if (!livesLeft)
				room.status = 'finished';
			await this.roomRepository.save(room);
			if (!livesLeft)
				return { result: 'GAME_OVER', lives: 0 };
			else
				return { result: 'WRONG', lives: livesLeft };
		}
	}
}
