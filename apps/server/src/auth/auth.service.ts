import { auth } from '@iot-manager/proto';
import {
  BadRequestException,
  Inject,
  Injectable,
  OnModuleInit,
} from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import {
  CredentialsLoginDto,
  LogoutDto,
  RefreshTokensDto,
  RegisterAccountDto,
} from './dto';

@Injectable()
export class AuthService implements OnModuleInit {
  private authServiceClient: auth.AuthServiceClient;
  onModuleInit() {
    this.authServiceClient = this.client.getService<auth.AuthServiceClient>(
      auth.AUTH_SERVICE_NAME,
    );
  }

  constructor(@Inject('AUTH_PACKAGE') private client: ClientGrpc) {}

  credentialsRegister(dto: RegisterAccountDto) {
    return this.authServiceClient.credentialsRegister(dto);
  }

  async credentialsLogin(
    dto: CredentialsLoginDto,
    agent: string,
  ): Promise<auth.LoginResponse> {
    const loginData = await lastValueFrom(
      this.authServiceClient.credentialsLogin({
        ...dto,
        agent,
      }),
    );

    if (!loginData) {
      throw new BadRequestException("can't login user");
    }

    return loginData;
  }

  logout(logoutDto: LogoutDto) {
    this.authServiceClient.logout(logoutDto);
  }

  async refreshTokens(dto: RefreshTokensDto) {
    return await lastValueFrom(this.authServiceClient.refreshTokens(dto));
  }

  getAccountInfo(userId: string): Promise<auth.Account> {
    return lastValueFrom(this.authServiceClient.getAccountInfo({ userId }));
  }
}
