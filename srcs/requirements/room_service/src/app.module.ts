import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { Room } from './room.entity';

@Module({
	imports: [
		TypeOrmModule.forRoot({
			type: 'postgres',
			host: process.env.DB_HOST_ROOM,
			port: Number(process.env.DB_PORT_ROOM),
			username: process.env.DB_USERNAME_ROOM,
			password: process.env.DB_PASSWORD_ROOM,
			database: process.env.DB_NAME_ROOM,
			entities: [Room],
			synchronize: true
		}),
		TypeOrmModule.forFeature([Room]),
	],
	controllers: [AppController],
	providers: [],
})

export class AppModule {}
