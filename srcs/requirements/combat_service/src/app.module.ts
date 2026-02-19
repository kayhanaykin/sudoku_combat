import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppGateway } from './app.gateway';
import { Room } from './room.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'combat_db', 
      port: 5432,
      username: process.env.POSTGRES_USER_combat, // .env'den combat_user
      password: process.env.POSTGRES_PASSWORD_combat, // .env'den combat_pass
      database: process.env.POSTGRES_DB_combat, // .env'den combat_db
      entities: [Room],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([Room]),
  ],
  controllers: [AppController],
  providers: [AppGateway],
})
export class AppModule {}
