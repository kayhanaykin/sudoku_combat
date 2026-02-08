import { Controller, Post, Delete, Body, Param } from '@nestjs/common';
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
	USER_NOT_IN_ROOM: { success: false, message: 'User is not in this room' }
};

@Controller('room')
export class AppController
{
	constructor(
		@InjectRepository(Room)
		private roomRepository: Repository<Room>
	) {}

	@Post('create')
	async	roomCreate(@Body() body: { userId: string })
	{
		if (!body.userId)
			return ERROR.USER_ID_REQUIRED;
		try
		{
			const room = this.roomRepository.create({ ownerId: body.userId });
			const saved = await this.roomRepository.save(room);
			return {success: true, roomId: saved.id };
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
}
