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
    
    private roomStartTimes = new Map<string, number>(); 
    
    private spectator: WebSocket | null = null;

    @SubscribeMessage('join_room')
    async handleJoinRoom(@MessageBody() data: { roomId: string }, @ConnectedSocket() client: WebSocket) 
    {
        if (!this.rooms.has(data.roomId))
            this.rooms.set(data.roomId, new Set());
            
        const roomClients = this.rooms.get(data.roomId)!;
        roomClients.add(client);
        (client as any).roomId = data.roomId;

        if (roomClients.size === 2 && !this.roomStartTimes.has(data.roomId))
		{
            const startTime = Date.now() + 3000;
            this.roomStartTimes.set(data.roomId, startTime);

            try
			{
                const currBoardRes = await fetch(`http://localhost:8003/api/room/game-state/${data.roomId}`);
                const gameState = await currBoardRes.json();
                
                gameState.startTime = startTime;

                const payload = JSON.stringify({ 
                    event: 'sync_game', 
                    gameState: gameState,
                    ownerHealth: gameState.health ? gameState.health[0] : 3,
                    guestHealth: gameState.health ? gameState.health[1] : 3
                });

                roomClients.forEach((ws: WebSocket) => {
                    if (ws.readyState === ws.OPEN)
                        ws.send(payload);
                });
            }
			catch (error)
			{
                console.error("Başlangıç senkronizasyon hatası:", error);
            }
        }
        else if (roomClients.size <= 2 && this.roomStartTimes.has(data.roomId))
		{
             try
			{
                const currBoardRes = await fetch(`http://localhost:8003/api/room/game-state/${data.roomId}`);
                const gameState = await currBoardRes.json();
                
                gameState.startTime = this.roomStartTimes.get(data.roomId);

                client.send(JSON.stringify({ 
                    event: 'sync_game', 
                    gameState: gameState,
                    ownerHealth: gameState.health ? gameState.health[0] : 3,
                    guestHealth: gameState.health ? gameState.health[1] : 3
                }));
            } catch (error) {
                console.error("Yeniden bağlanma senkronizasyon hatası:", error);
            }
        }
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
                
                if (this.roomStartTimes.has(data.roomId))
                    gameState.startTime = this.roomStartTimes.get(data.roomId);

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
                    moveBy: data.role,
                    ownerMoves: gameState.ownerMoves,
                    guestMoves: gameState.guestMoves
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
            
            if (this.roomStartTimes.has(data.roomId))
                gameState.startTime = this.roomStartTimes.get(data.roomId);

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
				{
                    this.rooms.delete(roomId);
                    this.roomStartTimes.delete(roomId);
                }
            }
        }
        if (this.spectator === client)
            this.spectator = null;
    }
}