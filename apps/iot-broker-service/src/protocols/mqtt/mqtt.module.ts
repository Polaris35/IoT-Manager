import { Module } from '@nestjs/common';
import { MqttService } from './mqtt.service';
import { TelemetryModule } from '../../telemetry/telemetry.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { device } from '@iot-manager/proto';

@Module({
  imports: [
    ConfigModule,
    TelemetryModule,
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
  providers: [MqttService],
  exports: [MqttService],
})
export class MqttModule {}
