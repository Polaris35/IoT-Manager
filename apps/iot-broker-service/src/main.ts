import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  MicroserviceOptions,
  RpcException,
  Transport,
} from '@nestjs/microservices';
import { ValidationError, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: [
          `amqp://${process.env.RABBITMQ_USER}:${process.env.RABBITMQ_PASSWORD}@${process.env.RABBITMQ_HOST}:${process.env.RABBITMQ_PORT}`,
        ],
        queue: process.env.RABBITMQ_EVENTS_QUEUE,
        queueOptions: {
          durable: true,
        },
        noAck: false,
      },
    },
  );

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      exceptionFactory: (errors: ValidationError[]) => {
        console.error('❌ VALIDATION FAILED:', JSON.stringify(errors, null, 2));

        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return new RpcException(errors);
      },
    }),
  );
  await app.listen();
}
void bootstrap();
