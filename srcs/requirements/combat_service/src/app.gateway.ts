import { Server, WebSocket } from 'ws';
import {
	WebSocketGateway,
	WebSocketServer,
	SubscribeMessage,
	ConnectedSocket,
	MessageBody,
	OnGatewayDisconnect
} from '@nestjs/websockets';

const ROOM_LINK = 'http://127.0.0.1:8003/api/room/';

@WebSocketGateway({ path: '/api/play' })
export class AppGateway implements OnGatewayDisconnect
{
	@WebSocketServer()
	server: Server;

	private rooms = new Map<string, Set<WebSocket>>();

	private async	fetchGameState(roomId: string, userId?: string)
	{
		const qs = userId ? `?userId=${encodeURIComponent(userId)}` : '';
		const res = await fetch(`${ROOM_LINK}game-state/${roomId}${qs}`);
		return res.json();
	}

	private	broadcast(roomClients: Set<WebSocket>, payload: string)
	{
		roomClients.forEach((ws: WebSocket) => {
			if (ws.readyState === ws.OPEN)
				ws.send(payload);
		});
	}

	@SubscribeMessage('join_room')
	async	handleJoinRoom(@MessageBody() data: { roomId: string, userId?: string }, @ConnectedSocket() client: WebSocket)
	{
		if (!this.rooms.has(data.roomId))
			this.rooms.set(data.roomId, new Set());
		const roomClients = this.rooms.get(data.roomId)!;
		roomClients.add(client);
		(client as any).roomId = data.roomId;
		(client as any).userId = data.userId || '';

		try
		{
			const gameState = await this.fetchGameState(data.roomId, (client as any).userId);
			if (gameState && gameState.gameStartTime)
				gameState.startTime = new Date(gameState.gameStartTime).getTime();

			const syncPayload = JSON.stringify({
				event: 'sync_game',
				gameState: gameState,
				ownerHealth: gameState?.health ? gameState.health[0] : 3,
				guestHealth: gameState?.health ? gameState.health[1] : 3,
				ownerMoves: gameState?.ownerMoves ?? 0,
				guestMoves: gameState?.guestMoves ?? 0,
				status: gameState?.status
			});

			client.send(syncPayload);
			if (roomClients.size > 1)
			{
				this.broadcast(roomClients, JSON.stringify({
					event: 'opponent_reconnected'
				}));
			}
		}
		catch (error)
		{
			return { success: false, error: error.message };
		}
	}

	@SubscribeMessage('move')
	async	handleMove( @MessageBody() data: { roomId: string, role: string, row?: number; col?: number; value?: number; action?: string },
		@ConnectedSocket() client: WebSocket )
	{
		try
		{
			const clientUserId = (client as any).userId || '';
			if (data.action === 'surrender')
			{
				const sRes = await fetch(`${ROOM_LINK}surrender/${data.roomId}`,
				{
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ userId: clientUserId, role: data.role })
				});
				if (!sRes.ok)
					return client.send(JSON.stringify({ event: 'error', message: 'Room service communication error' }));
				const sData = await sRes.json();
				if (!sData.success)
					return client.send(JSON.stringify({ event: 'error', message: sData.message || 'Surrender failed' }));
				const roomClients = this.rooms.get(data.roomId);
				if (roomClients)
				{
					const payload = JSON.stringify({
						event: 'sync_game',
						ownerHealth: sData.ownerHealth,
						guestHealth: sData.guestHealth,
						loser: sData.loser,
						winner: sData.winner,
						isWin: false,
						surrender: true,
						moveBy: data.role,
						status: sData.status
					});
					this.broadcast(roomClients, payload);
				}
				return;
			}
			const res = await fetch(`${ROOM_LINK}validate-move/${data.roomId}`,
			{
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(data)
			});
			if (!res.ok)
				return client.send(JSON.stringify({ event: 'error', message: 'Room service communication error' }));
			const { valid, ownerHealth, guestHealth, loser, winner, isWin, status } = await res.json();
			const roomClients = this.rooms.get(data.roomId);
			if (roomClients)
			{
				const gameState = await this.fetchGameState(data.roomId, clientUserId);
				if (gameState && gameState.gameStartTime)
					gameState.startTime = new Date(gameState.gameStartTime).getTime();
				const payload = JSON.stringify(
				{
					event: 'sync_game',
					gameState: gameState,
					ownerHealth,
					guestHealth,
					valid,
					loser,
					winner,
					isWin,
					status,
					moveBy: data.role,
					ownerMoves: gameState.ownerMoves,
					guestMoves: gameState.guestMoves
				});
				this.broadcast(roomClients, payload);
			}
		}
		catch (error)
		{
			client.send(JSON.stringify({ event: 'error', message: 'Room service communication error' }));
		}
	}

	async	handleDisconnect(@ConnectedSocket() client: WebSocket)
	{
		const roomId = (client as any).roomId;
		if (!roomId)
			return;
		const roomClients = this.rooms.get(roomId);
		if (!roomClients)
			return;

		roomClients.delete(client);

		this.broadcast(roomClients, JSON.stringify({
			event: 'opponent_disconnected'
		}));

		if (!roomClients.size)
			this.rooms.delete(roomId);
	}
}
