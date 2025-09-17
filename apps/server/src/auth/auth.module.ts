import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AUTH_PACKAGE_NAME } from '@iot-manager/proto';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { AuthService } from './auth.service';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'AUTH_PACKAGE',
        transport: Transport.GRPC,
        options: {
          package: AUTH_PACKAGE_NAME,
          protoPath: join(
            __dirname,
            '../../node_modules/@iot-manager/proto/proto/auth.proto',
          ),
        },
      },
    ]),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
