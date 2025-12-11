import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DeviceLifecycleModule } from './device-lifecycle/device-lifecycle.module';
import { TelemetryModule } from './telemetry/telemetry.module';
import { MqttModule } from './protocols/mqtt/mqtt.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MqttModule,
    DeviceLifecycleModule,
    TelemetryModule,
  ],
})
export class AppModule {}
