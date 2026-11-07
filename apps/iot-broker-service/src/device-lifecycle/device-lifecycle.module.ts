import { Module } from '@nestjs/common';
import { DeviceLifecycleController } from './device-lifecycle.controller';
import { DeviceLifecycleService } from './device-lifecycle.service';
import { MqttModule } from '../protocols/mqtt/mqtt.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { device } from '@iot-manager/proto';

@Module({
  imports: [
    MqttModule,
    ConfigModule,
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
            // loader: {
            //   keepCase: true,
            //   longs: String,
            //   enums: String,
            //   defaults: true,
            //   oneofs: true,
            // },
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [DeviceLifecycleController],
  providers: [DeviceLifecycleService],
})
export class DeviceLifecycleModule {}
