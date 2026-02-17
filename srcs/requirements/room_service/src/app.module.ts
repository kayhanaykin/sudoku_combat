import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { Room } from './room.entity';

// srcs/requirements/room_service/src/app.module.ts

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'room_db', 
      port: 5432,
      username: process.env.POSTGRES_USER_room, // .env'den room_user
      password: process.env.POSTGRES_PASSWORD_room, // .env'den room_pass
      database: process.env.POSTGRES_DB_room, // .env'den room_db
      entities: [Room],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([Room]),
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}