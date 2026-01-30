import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { Room } from './room.entity';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true, 
            envFilePath: '.env',
        }),

        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                type: 'postgres',
                host: configService.get<string>('DB_HOST_COMBAT'),
                port: configService.get<number>('DB_PORT_COMBAT'),
                username: configService.get<string>('DB_USERNAME_COMBAT'),
                password: configService.get<string>('DB_PASSWORD_COMBAT'),
                database: configService.get<string>('DB_NAME_COMBAT'),
                entities: [Room],
                synchronize: true,
            }),
        }),
        TypeOrmModule.forFeature([Room]),
    ],
    controllers: [AppController],
    providers: [],
})

export class AppModule {}
