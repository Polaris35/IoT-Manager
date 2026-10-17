import { Module } from '@nestjs/common';
import { DevicesController } from './devices.controller';
import { DevicesService } from './devices.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { device } from '@iot-manager/proto';
import { ProfilesController } from './profiles.controller';
import { ProfilesService } from './profiles.service';
import { GroupsService } from './groups.service';
import { GroupsController } from './groups.controller';

@Module({
  controllers: [DevicesController, ProfilesController, GroupsController],
  providers: [DevicesService, ProfilesService, GroupsService],
  imports: [
    ClientsModule.registerAsync([
      {
        name: 'DEVICE_PACKAGE',
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            url: configService.get<string>('DEVICE_SERVICE_GRPC_URL'),
            package: device.DEVICE_PACKAGE_NAME,
            protoPath: require.resolve('@iot-manager/proto/proto/device.proto'),
            loader: {
              keepCase: true,
              longs: String,
              enums: String,
              defaults: true,
              oneofs: true,
            },
          },
        }),
        inject: [ConfigService],
      },
      {
        name: 'IOT_BROKER_CLIENT',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [
              `amqp://${config.get('RABBITMQ_USER')}:${config.get('RABBITMQ_PASSWORD')}@${config.get('RABBITMQ_HOST')}:${config.get('RABBITMQ_PORT')}/${config.get('RABBITMQ_VHOST') || ''}`,
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
