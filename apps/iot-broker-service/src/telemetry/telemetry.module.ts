// apps/iot-broker-service/src/telemetry/telemetry.module.ts
import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TelemetryService } from './telemetry.service';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: 'TELEMETRY_RMQ_CLIENT',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [
              `amqp://${config.get('RABBITMQ_USER')}:${config.get('RABBITMQ_PASSWORD')}@${config.get('RABBITMQ_HOST')}:${config.get('RABBITMQ_PORT')}`,
            ],
            queue: config.get<string>('RABBITMQ_TELEMETRY_QUEUE'),
            queueOptions: { durable: true },
          },
        }),
      },
    ]),
  ],
  providers: [TelemetryService],
  exports: [TelemetryService],
})
export class TelemetryModule {}
