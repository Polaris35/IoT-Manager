import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AUTH_PACKAGE_NAME } from '@iot-manager/proto';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.GRPC,
      options: {
        package: AUTH_PACKAGE_NAME,
        protoPath: join(
          __dirname,
          './../node_modules/@iot-manager/proto/proto/auth.proto',
        ),
      },
    },
  );
  await app.listen();
}
// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap();
