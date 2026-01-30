import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { Room } from './room.entity';

@Module({
	imports: [
		TypeOrmModule.forRoot({
			type: 'postgres',
			host: process.env.POSTGRES_DB,
			port: Number(process.env.POSTGRES_PORT),
			username: process.env.POSTGRES_USER,
			password: process.env.POSTGRES_PASSWORD,
			database: process.env.POSTGRES_DB,
			entities: [Room],
			synchronize: true
		}),
		TypeOrmModule.forFeature([Room]),
	],
	controllers: [AppController],
	providers: [],
})

export class AppModule {}
