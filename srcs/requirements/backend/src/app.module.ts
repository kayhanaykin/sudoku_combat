import { Module } from '@nestjs/common';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { SudokuController } from './app.sudoku';

@WebSocketGateway({ cors: true})
class TimeGateway
{
	@WebSocketServer() server: Server;
	private timer: NodeJS.Timeout;

	afterInit()
	{
		this.timer = setInterval(() => {
			const now = new Date();
			const formatted = now.toLocaleString('tr-TR', {
				day: '2-digit',
				month: '2-digit',
				year: 'numeric',
				hour: '2-digit',
				minute: '2-digit',
				second: '2-digit'
			});
			this.server.emit('time', { now: formatted });
		}, 1000);
	}

	onModuleDestroy()
	{
		if (this.timer)
			clearInterval(this.timer);
	}
}

@Module({
	controllers: [SudokuController],
	providers: [TimeGateway],
})

export class AppModule {}
