import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { Room } from './room.entity';

@Module({
	imports: [
		TypeOrmModule.forRoot({
			type: 'postgres',
			host: process.env.DB_HOST_COMBAT,
			port: Number(process.env.DB_PORT_COMBAT),
			username: process.env.DB_USERNAME_COMBAT,
			password: process.env.DB_PASSWORD_COMBAT,
			database: process.env.DB_NAME_COMBAT,
			entities: [Room],
			synchronize: true
		}),
		TypeOrmModule.forFeature([Room]),
	],
	controllers: [AppController],
	providers: [],
})

export class AppModule {}
