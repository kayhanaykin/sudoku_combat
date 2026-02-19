// filepath: /home/aepalaz/Desktop/sudoku_combat/srcs/requirements/combat_service/src/app.gateway.ts
import { Server, WebSocket } from 'ws';
import { WebSocketGateway,
	WebSocketServer,
	SubscribeMessage,
	ConnectedSocket,
	MessageBody
} from '@nestjs/websockets';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Room } from './room.entity';

@WebSocketGateway({ port: 8002 })
export class AppGateway
{
	@WebSocketServer()
	server: Server;

	constructor(
		@InjectRepository(Room)
		private roomRepository: Repository<Room>
	) {}

	private roomPlayers = new Map<string, Set<WebSocket>>();
	private roomSpectators = new Map<string, Set<WebSocket>>();

	@SubscribeMessage('join')
	async handleJoin(
		@MessageBody() data: { roomId: string, userId: string },
		@ConnectedSocket() client: WebSocket
	) {
		if (!this.roomPlayers.has(data.roomId))
			this.roomPlayers.set(data.roomId, new Set());
		this.roomPlayers.get(data.roomId)!.add(client);

		// Odaya katılan oyuncuya mevcut oyun durumunu gönder
		const gameState = await this.getGameState(data.roomId);
		client.send(JSON.stringify({ event: 'game_state', gameState }));
	}

	@SubscribeMessage('move')
	async handleMove(
		@MessageBody() data: { roomId: string, userId: string, row: number, col: number, value: number },
		@ConnectedSocket() client: WebSocket
	) {
		try {
			const valid = await this.validateMove(data.roomId, data.row, data.col, data.value);
			let loser: string | null = null;
			let ownerHealth = 0, guestHealth = 0;

			if (valid) {
				await this.updateBoard(data.roomId, data.row, data.col, data.value);
			} else {
				await this.decrementHealth(data.roomId, data.userId);
			}

			({ ownerHealth, guestHealth } = await this.getHealth(data.roomId));
			loser = await this.checkLoser(data.roomId);

			const gameState = await this.getGameState(data.roomId);

			// Herkese oyun durumu ve sağlık güncellemesi gönder
			this.broadcast(data.roomId, {
				event: valid ? 'opponent_move' : 'invalid_move',
				...data,
				gameState
			}, client);

			this.broadcast(data.roomId, {
				event: 'health_update',
				ownerHealth,
				guestHealth
			});

			if (loser) {
				this.broadcast(data.roomId, {
					event: 'lost',
					loser
				});
			}
		} catch (error) {
			client.send(JSON.stringify({ event: 'error', message: 'Internal server error' }));
		}
	}

	@SubscribeMessage('spectate')
	async handleSpectate(
		@MessageBody() data: { roomId: string },
		@ConnectedSocket() client: WebSocket
	) {
		if (!this.roomSpectators.has(data.roomId))
			this.roomSpectators.set(data.roomId, new Set());
		this.roomSpectators.get(data.roomId)!.add(client);

		try {
			const gameState = await this.getGameState(data.roomId);
			client.send(JSON.stringify({ event: 'game_state', gameState }));
		} catch (error) {
			client.send(JSON.stringify({ event: 'error', message: 'Internal server error' }));
		}
	}

	@SubscribeMessage('disconnect')
	async handleDisconnect(
		@MessageBody() data: { roomId: string, playerId: string },
		@ConnectedSocket() client: WebSocket
	) {
		this.roomPlayers.get(data.roomId)?.delete(client);
		this.roomSpectators.get(data.roomId)?.delete(client);

		this.broadcast(data.roomId, {
			event: 'player_left',
			playerId: data.playerId
		});
	}

	// --- Yardımcı Fonksiyonlar ---

	private broadcast(roomId: string, message: any, except?: WebSocket) {
		const msg = JSON.stringify(message);
		this.roomPlayers.get(roomId)?.forEach(ws => {
			if (ws.readyState === ws.OPEN && ws !== except)
				ws.send(msg);
		});
		this.roomSpectators.get(roomId)?.forEach(ws => {
			if (ws.readyState === ws.OPEN && ws !== except)
				ws.send(msg);
		});
	}

	private async validateMove(roomId: string, row: number, col: number, value: number): Promise<boolean> {
		const room = await this.roomRepository.findOne({ where: { id: +roomId } });
		if (!room) return false;
		return value === room.solvedBoard[row][col];
	}

	private async updateBoard(roomId: string, row: number, col: number, value: number) {
		const room = await this.roomRepository.findOne({ where: { id: +roomId } });
		if (!room) return;
		room.currBoard[row][col] = value;
		await this.roomRepository.save(room);
	}

	private async decrementHealth(roomId: string, userId: string) {
		const room = await this.roomRepository.findOne({ where: { id: +roomId } });
		if (!room) return;
		if (room.ownerId === userId)
			room.health[0] = Math.max(0, room.health[0] - 1);
		else if (room.guestId === userId)
			room.health[1] = Math.max(0, room.health[1] - 1);
		await this.roomRepository.save(room);
	}

	private async getHealth(roomId: string): Promise<{ ownerHealth: number, guestHealth: number }> {
		const room = await this.roomRepository.findOne({ where: { id: +roomId } });
		if (!room) return { ownerHealth: 0, guestHealth: 0 };
		return { ownerHealth: room.health[0], guestHealth: room.health[1] };
	}

	private async checkLoser(roomId: string): Promise<string | null> {
		const room = await this.roomRepository.findOne({ where: { id: +roomId } });
		if (!room) return null;
		if (room.health[0] <= 0) return room.ownerId;
		if (room.health[1] <= 0) return room.guestId;
		return null;
	}

	private async getGameState(roomId: string): Promise<any> {
		const room = await this.roomRepository.findOne({ where: { id: +roomId } });
		if (!room) return {};
		return {
			ownerId: room.ownerId,
			guestId: room.guestId,
			currBoard: room.currBoard,
			health: room.health,
			status: room.status
		};
	}
}
