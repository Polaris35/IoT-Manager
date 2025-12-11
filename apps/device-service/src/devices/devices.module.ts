import { Module } from '@nestjs/common';
import { DevicesController } from './devices.controller';
import { DevicesService } from './devices.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeviceEntity, DeviceProfileEntity, GroupEntity } from '@entities';
import { GroupsService } from './groups.service';
import { GroupsController } from './groups.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  controllers: [DevicesController, GroupsController],
  providers: [DevicesService, GroupsService],
  imports: [
    TypeOrmModule.forFeature([DeviceEntity, DeviceProfileEntity, GroupEntity]),
    ClientsModule.registerAsync([
      {
        name: 'IOT_BROKER_CLIENT',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [
              `amqp://${config.get('RABBITMQ_USER')}:${config.get('RABBITMQ_PASSWORD')}@${config.get('RABBITMQ_HOST')}:${config.get('RABBITMQ_PORT')}`,
            ],
            queue: config.get('RABBITMQ_EVENTS_QUEUE'), // Например 'iot_events_queue'
            queueOptions: {
              durable: true,
            },
          },
        }),
      },
    ]),
  ],
})
export class DevicesModule {}
