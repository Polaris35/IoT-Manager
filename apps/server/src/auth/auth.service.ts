import {
  AUTH_SERVICE_NAME,
  AuthServiceClient,
  LoginResponse,
} from '@iot-manager/proto';
import {
  BadRequestException,
  Inject,
  Injectable,
  OnModuleInit,
} from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import {
  CredentialsLoginDto,
  LogoutDto,
  RegisterAccountDto,
} from '@iot-manager/nest-libs/dto';
import { lastValueFrom } from 'rxjs';
import { AccountWithTokens } from './types/account-with-tokens';

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

  async credentialsLogin(
    dto: CredentialsLoginDto,
    agent: string,
  ): Promise<AccountWithTokens> {
    const loginData = await lastValueFrom(
      this.authServiceClient.credentialsLogin({
        ...dto,
        agent,
      }),
    );
    console.log(loginData);

    if (!loginData) {
      throw new BadRequestException("can't login user");
    }

    return this.constructLoginRespose(loginData);
  }

  logout(logoutDto: LogoutDto) {
    this.authServiceClient.logout(logoutDto);
  }

  private constructLoginRespose(loginData: LoginResponse): AccountWithTokens {
    return {
      account: loginData.account!,
      accessToken: loginData.tokens?.accessToken!,
      refreshToken: {
        token: loginData.tokens?.refreshToken?.token!,

        exp: new Date(loginData.tokens?.refreshToken?.expInISOString as string),
        userAgent: loginData.tokens?.refreshToken?.userAgent!,
      },
    };
  }
}
