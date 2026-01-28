import {
	WebSocketGateway,
	WebSocketServer,
/*
	ConnectedSocket,
	OnGatewayInit,
	OnGatewayConnection,
	OnGatewayDisconnect
*/
} from '@nestjs/websockets';

@WebSocketGateway()
// export class GameGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
export class GameGateway
{
	@WebSocketServer() server: Server;

	afterInıt(server: Server)
	{}

	handleConnection(client: WebSocket)
	{}

	handleDisconnect(client: WebSocket)
	{}
}
