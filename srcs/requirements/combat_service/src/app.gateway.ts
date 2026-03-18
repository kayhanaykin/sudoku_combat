import { Server, WebSocket } from 'ws';
import {
	WebSocketGateway,
	WebSocketServer,
	SubscribeMessage,
	ConnectedSocket,
	MessageBody
} from '@nestjs/websockets';

@WebSocketGateway({ path: '/api/play' })
export class AppGateway
{
	@WebSocketServer()
	server: Server;

	private rooms = new Map<string, Set<WebSocket>>();
	private spectator: WebSocket | null = null;

	@SubscribeMessage('join_room')
	handleJoinRoom(@MessageBody() data: { roomId: string }, @ConnectedSocket() client: WebSocket) 
	{
		if (!this.rooms.has(data.roomId))
			this.rooms.set(data.roomId, new Set());
		this.rooms.get(data.roomId)!.add(client);
		(client as any).roomId = data.roomId;
	}

	@SubscribeMessage('move')
	async handleMove(
		@MessageBody() data: { roomId: string, role: string, row: number; col: number; value: number; },
		@ConnectedSocket() client: WebSocket )
	{
		try
		{
			const res = await fetch(`http://localhost:8003/api/room/validate-move/${data.roomId}`,
			{
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(data)
			});
			const { valid, ownerHealth, guestHealth, loser, winner, isWin } = await res.json();
			const roomClients = this.rooms.get(data.roomId);
			if (roomClients)
			{
				const currBoardRes = await fetch(`http://localhost:8003/api/room/game-state/${data.roomId}`);
				const gameState = await currBoardRes.json();
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
					moveBy: data.role
				});
				roomClients.forEach((ws: WebSocket) =>
				{
					if (ws.readyState === ws.OPEN)
						ws.send(payload);
				});
				if (this.spectator && this.spectator.readyState === this.spectator.OPEN)
					this.spectator.send(payload);
			}
		}
		catch (error)
		{
			client.send(JSON.stringify({ event: 'error', message: 'Room service communication error' }));
		}
	}

	@SubscribeMessage('spectate')
	async handleSpectate(
		@MessageBody() data: { roomId: string },
		@ConnectedSocket() client: WebSocket )
	{
		try
		{
			this.spectator = client;
			const res = await fetch(`http://localhost:8003/api/room/game-state/${data.roomId}`);
			const gameState = await res.json();
			client.send(JSON.stringify({ event: 'game_state', gameState }));
		}
		catch (error)
		{
			client.send(JSON.stringify({ event: 'error', message: 'Room service communication error' }));
		}
	}

	async handleDisconnect(@ConnectedSocket() client: WebSocket)
	{
		const roomId = (client as any).roomId;
		if (roomId)
		{
			const roomClients = this.rooms.get(roomId);
			if (roomClients)
			{
				roomClients.delete(client);
				roomClients.forEach((ws: WebSocket) =>
				{
					if (ws.readyState === ws.OPEN)
						ws.send(JSON.stringify({ event: 'player_left' }));
				});
				if (roomClients.size === 0)
					this.rooms.delete(roomId);
			}
		}
		if (this.spectator === client)
			this.spectator = null;
	}
}
