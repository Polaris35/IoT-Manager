import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { device } from '@iot-manager/proto';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.GRPC,
      options: {
        url: `0.0.0.0:${process.env.PORT}`,
        package: device.DEVICE_PACKAGE_NAME,
        protoPath: require.resolve('@iot-manager/proto/proto/device.proto'),
      },
    },
  );
  await app.listen();
}

void bootstrap();
