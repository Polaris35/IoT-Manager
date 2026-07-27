import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { InfluxdbModule } from './influxdb/influxdb.module';
import { TelemetryModule } from './telemetry/telemetry.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    InfluxdbModule,
    TelemetryModule,
  ],
})
export class AppModule {}
