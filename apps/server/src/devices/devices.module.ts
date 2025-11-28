import { Module } from '@nestjs/common';
import { DevicesController } from './devices.controller';
import { DevicesService } from './devices.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { device } from '@iot-manager/proto';
import { ProfilesController } from './profiles.controller';
import { ProfilesService } from './profiles.service';

@Module({
  controllers: [DevicesController, ProfilesController],
  providers: [DevicesService, ProfilesService],
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
    ]),
  ],
})
export class DevicesModule {}
