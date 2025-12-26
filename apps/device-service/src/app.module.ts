import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DevicesModule } from './devices/devices.module';
import { ProfilesModule } from './profiles/profiles.module';
import { APP_FILTER } from '@nestjs/core';
import { GrpcServerExceptionFilter } from 'nestjs-grpc-exceptions';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USER'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        ssl: configService.get<string>('POSTGRES_SSL') === 'true',

        extra:
          configService.get<string>('POSTGRES_SSL') === 'true'
            ? {
                ssl: {
                  rejectUnauthorized: false,
                },
              }
            : undefined,
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true, // Only in develope mode
      }),
    }),
    DevicesModule,
    ProfilesModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: GrpcServerExceptionFilter,
    },
  ],
})
export class AppModule {}
