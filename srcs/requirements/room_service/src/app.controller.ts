import { Controller, Get, Post, Delete, Body, Param } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Room } from './room.entity';

const ERROR = {
	USER_ID_REQUIRED: { success: false, message: 'userId is required' },
	ROOM_ID_REQUIRED: { success: false, message: 'roomId is required' },
	ROOM_NOT_FOUND: { success: false, message: 'Room not found' },
	ROOM_FULL: { success: false, message: 'Room is full' },
	OWNER_CANNOT_JOIN: { success: false, message: 'Owner cannot join as guest' },
	DB_ERROR: (error: any) => ({ success: false, message: 'Database error', error: error.message }),
	USER_NOT_IN_ROOM: { success: false, message: 'User is not in this room' },
	LEVEL_REQUIRED: { success: false, message: 'level is required' }
};

@Controller()
export class AppController
{
	constructor(
		@InjectRepository(Room)
		private roomRepository: Repository<Room>)
	{}

	@Post('create')
	async	roomCreate(@Body() body: { userId: string, level: string })
	{
		if (!body.userId)
			return ERROR.USER_ID_REQUIRED;
		if (!body.level)
			return ERROR.LEVEL_REQUIRED;
		try
		{
			const res = await fetch(`http://game_service:8080/new-game?level=${body.level}`,
			{
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ level: body.level })
			});
			const gameData = await res.json();
			const room = this.roomRepository.create({
				ownerId: body.userId,
				solvedBoard: gameData.solvedBoard,
				currBoard: gameData.currBoard,
				health: [3, 0],
				status: 'waiting'
			});
			const saved = await this.roomRepository.save(room);
			return { success: true, roomId: saved.id };
		}
		catch (error)
		{
			return ERROR.DB_ERROR(error);
		}
	}

	@Post('join/:roomId')
	async	roomJoin(@Param('roomId') roomId: string, @Body() body: { userId: string })
	{
		if (!body.userId)
			return ERROR.USER_ID_REQUIRED;
		if (!roomId)
			return ERROR.ROOM_ID_REQUIRED;
		try
		{
			const room = await this.roomRepository.findOne({where: { id: +roomId } });
			if (!room)
				return ERROR.ROOM_NOT_FOUND;
			if (room.guestId)
				return ERROR.ROOM_FULL;
			if (room.ownerId === body.userId)
				return ERROR.OWNER_CANNOT_JOIN;
			room.guestId = body.userId;
			room.status = 'playing';
			room.health = [room.health[0], 3];
			await this.roomRepository.save(room);
			return { success: true, roomId: room.id };
		}
		catch (error)
		{
			return ERROR.DB_ERROR(error);
		}
	}

	@Delete('leave/:roomId')
	async	roomLeave(@Param('roomId') roomId: string, @Body() body: { userId: string })
	{
		if (!body.userId)
			return ERROR.USER_ID_REQUIRED;
		if (!roomId)
			return ERROR.ROOM_ID_REQUIRED;
		try
		{
			const room = await this.roomRepository.findOne({ where: { id: +roomId } });
			if (!room)
				return ERROR.ROOM_NOT_FOUND;
			if (room.ownerId === body.userId)
			{
				if (room.guestId)
				{
					room.ownerId = room.guestId;
					room.guestId = null;
					room.status = 'waiting';
				}
				else
				{
					await this.roomRepository.delete(room.id);
					return { success: true, message: 'Room deleted' };
				}
			}
			else if (room.guestId === body.userId)
			{
				room.guestId = null;
				room.health = [room.health[0], 0];
				room.status = 'waiting';
			}
			else
			{
				return ERROR.USER_NOT_IN_ROOM;
			}
			await this.roomRepository.save(room);
			return { success: true, message: 'Left room' };
		}
		catch (error)
		{
			return ERROR.DB_ERROR(error);
		}
	}

	@Post('validate-move/roomId=:roomId')
	async	validateMove(@Param('roomId') roomId: string, @Body() body: { row: number, col: number, value: number })
	{
		if (!roomId)
			return (ERROR.ROOM_ID_REQUIRED);
		try
		{
			const room = await this.roomRepository.findOne({ where: { id: +roomId } });
			if (!room)
				return (ERROR.ROOM_NOT_FOUND);
			return { valid: (body.value === room.solvedBoard[body.row][body.col]) };
		}
		catch (error)
		{
			return (ERROR.DB_ERROR(error));
		}
	}

	@Get('game-state/roomId=:roomId')
	async	getGameState(@Param('roomId') roomId: string)
	{
		if (!roomId)
			return (ERROR.ROOM_ID_REQUIRED);
		try
		{
			const room = await this.roomRepository.findOne({ where: {id: +roomId } });
			if (!room)
				return (ERROR.ROOM_NOT_FOUND);
			return {
				success: true,
				ownerId: room.ownerId,
				guestId: room.guestId,
				currBoard: room.currBoard,
				health: room.health,
				status: room.status
			}
		}
		catch (error)
		{
			return (ERROR.DB_ERROR(error));
		}
	}
}
