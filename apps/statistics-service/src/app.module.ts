import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { InfluxdbModule } from './influxdb/influxdb.module';
import { CollectorModule } from './collector/collector.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    InfluxdbModule,
    CollectorModule,
  ],
})
export class AppModule {}
