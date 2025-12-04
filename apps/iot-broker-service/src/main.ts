import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: [
          process.env.RABBITMQ_URL ||
            'amqp://admin:secret_password@localhost:5672',
        ],
        queue: 'iot_broker_lifecycle',
        queueOptions: {
          durable: true,
        },
      },
    },
  );
  await app.listen();
}
void bootstrap();
