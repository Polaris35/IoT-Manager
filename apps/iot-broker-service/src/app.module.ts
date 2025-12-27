import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DeviceLifecycleModule } from './device-lifecycle/device-lifecycle.module';
import { TelemetryModule } from './telemetry/telemetry.module';
import { MqttModule } from './protocols/mqtt/mqtt.module';
import { RedisClientModule } from './redis-client/redis-client.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MqttModule,
    DeviceLifecycleModule,
    TelemetryModule,
    RedisClientModule,
  ],
})
export class AppModule {}
