import { Server, WebSocket } from 'ws';
import {
	WebSocketGateway,
	WebSocketServer,
	SubscribeMessage,
	ConnectedSocket,
	MessageBody
} from '@nestjs/websockets';

@WebSocketGateway({ port: 8003 })
export class AppGateway
{
	@WebSocketServer()
	server: Server;
	private spectator = new WebSocket();

	/*
	handleConnection(client: WebSocket)
	{}
	//*/

	@SubscribeMessage('move')
	async	handleMove(
		@MessageBody() data: { roomId: string, row: number; col: number; value: number; },
		@ConnectedSocket() client: WebSocket )
	{
		try
		{
			const res = await fetch(`http://room_service:8002/validate-room/roomId?=${data.roomId}`,
			{
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(data)
			});
			const { valid, ownerHealth, guestHealth, loser } = await res.json();
			if (valid)
			{
				const currBoard = await fetch(`http://room_service:8002/game-state?roomId=${data.roomId}`);
				const gameState = await currBoard.json();
				this.server.clients.forEach((ws: WebSocket) => {
					if (ws !== client && ws.readyState === ws.OPEN )
						ws.send(JSON.stringify({ event: 'opponent_move', ...data, gameState }));
				});
				if (this.spectator && this.spectator.readyState === this.spectator.OPEN)
					this.spectator.send(JSON.stringify({ event: 'opponent_move', ...data, gameState }));
			}
			this.server.clients.forEach((ws: WebSocket) => {
				if (ws.readyState === ws.OPEN)
					ws.send(JSON.stringify({ event: 'health_update', ownerHealth, guestHealth }));
			});
			if (loser)
			{
				this.server.clients.forEach((ws: WebSocket) => {
					if (ws.readyState === ws.OPEN)
						ws.send(JSON.stringify({ event: 'lost', loser }));
				});
				if (this.spectator && this.spectator.readyState === this.spectator.OPEN)
					this.spectator.send(JSON.stringify({ event: 'lost', loser }));
			}
		}
		catch (error)
		{
			client.send(JSON.stringify({ event: 'error', message: 'Room service communication error' }));
		}
	}

	@SubscribeMessage('spectate')
	async	handleSpectate(
		@MessageBody() data: { roomId: string },
		@ConnectedSocket() client: WebSocket )
	{
		try
		{
			this.spectator = client;
			const res = await fetch(`http://room_service:8002/get-table?roomId=${data.roomId}`);;
			const gameState = await res.json();
			client.send(JSON.stringify({ event: 'game_state', gameState }));
		}
		catch (error)
		{
			client.send(JSON.stringify({ event: 'error', message: 'Room service communication error' }));
		}
	}

	async	handleDisconnect(
		@MessageBody() data: { roomId: string, playerId: string },
		@ConnectedSocket() client: WebSocket)
	{
		if (this.spectator === client)
			this.spectator = null;
		else
		{
			this.server.clients.forEach((ws: WebSocket) => {
				if (ws !== client && ws.readyState === ws.OPEN)
					ws.send(JSON.stringify({ event: 'player_left', playerId: data.playerId }));
			});
			if (this.spectator && this.spectator.readyState == this.spectator.OPEN)
				this.spectator.send(JSON.stringify({ event: 'player_left', playerId: data.playerId }));
		}
	}
}
