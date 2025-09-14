import { AUTH_SERVICE_NAME, AuthServiceClient } from '@iot-manager/proto';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { RegisterAccountDto } from '@iot-manager/nest-libs/dto';

@Injectable()
export class AuthService implements OnModuleInit {
  private authServiceClient: AuthServiceClient;
  onModuleInit() {
    this.authServiceClient =
      this.client.getService<AuthServiceClient>(AUTH_SERVICE_NAME);
  }

  constructor(@Inject('AUTH_PACKAGE') private client: ClientGrpc) {}

  credentialsRegister(dto: RegisterAccountDto) {
    return this.authServiceClient.credentialsRegister(dto);
  }
}
