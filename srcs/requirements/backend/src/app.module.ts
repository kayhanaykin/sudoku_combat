import { Module } from '@nestjs/common';
import { SudokuController } from './app.sudoku';
import { GameGateway } from './app.gamegateway';

@Module({
	imports: [],
	controllers: [SudokuController],
	providers: [GameGateway],
})

export class AppModule {}
