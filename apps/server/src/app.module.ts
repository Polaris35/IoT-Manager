import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { DevicesModule } from './devices/devices.module';
import { AuthClientModule } from '@auth/auth-client.module';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from '@auth/guards';
import { StatsModule } from './stats/stats.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    AuthClientModule,
    AuthModule,
    DevicesModule,
    StatsModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}
