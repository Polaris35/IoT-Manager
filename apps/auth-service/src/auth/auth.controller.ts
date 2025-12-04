import { Controller } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AccountProvider } from '@entities';
import { TokenService } from '@tokens/token.service';
import { GrpcMethod } from '@nestjs/microservices';
import { auth } from '@iot-manager/proto';
import {
  GrpcInvalidArgumentException,
  GrpcUnknownException,
} from 'nestjs-grpc-exceptions';

@Controller()
export class AuthController implements auth.AuthServiceController {
  constructor(
    private readonly authService: AuthService,
    private readonly tokenService: TokenService,
  ) {}

  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  @GrpcMethod(auth.AUTH_SERVICE_NAME)
  async credentialsRegister(dto: auth.RegisterRequest): Promise<void> {
    const account = await this.authService.register(dto);

    if (!account) {
      throw new GrpcUnknownException(
        `Can't registrate account ${JSON.stringify(dto)}`,
      );
    }
  }
  @GrpcMethod(auth.AUTH_SERVICE_NAME)
  async googleLogin(dto: auth.GoogleLoginRequest): Promise<auth.LoginResponse> {
    const { agent, code } = dto;
    const userWithTokens = await this.authService.authorize(
      { code },
      agent,
      AccountProvider.GOOGLE,
    );

    if (!userWithTokens) {
      throw new GrpcUnknownException(`Can't login user`);
    }

    return userWithTokens;
  }

  @GrpcMethod(auth.AUTH_SERVICE_NAME)
  async credentialsLogin(
    dto: auth.CredentialsLoginRequest,
  ): Promise<auth.LoginResponse> {
    const { agent, ...dtoWithoutAgent } = dto;

    const userWithTokens = await this.authService.authorize(
      dtoWithoutAgent,
      agent,
      AccountProvider.CREDENTIALS,
    );
    if (!userWithTokens) {
      throw new GrpcUnknownException(`Can't login user`);
    }

    return userWithTokens;
  }

  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  @GrpcMethod(auth.AUTH_SERVICE_NAME)
  async logout(dto: auth.LogoutRequest) {
    if (!dto) {
      throw new GrpcInvalidArgumentException('refreshToken is required');
    }
    const rezult = await this.tokenService.deleteRefreshToken(dto.refreshToken);
    console.log(rezult);
  }

  @GrpcMethod(auth.AUTH_SERVICE_NAME)
  async refreshTokens(dto: auth.RefreshTokensRequest) {
    if (!dto) {
      throw new GrpcInvalidArgumentException('no data provided in dto');
    }
    const tokens = await this.tokenService.refreshToken(
      dto.refreshToken,
      dto.agent,
    );
    if (!tokens) {
      throw new GrpcUnknownException("Can't update refresh token");
    }
    return tokens;
  }

  @GrpcMethod(auth.AUTH_SERVICE_NAME)
  async validateAccessToken(request: auth.ValidateAccessTokenRequest) {
    return this.tokenService.validateAccessToken(request.accessToken);
  }

  @GrpcMethod(auth.AUTH_SERVICE_NAME)
  async getAccountInfo(
    request: auth.GetAccountInfoRequest,
  ): Promise<auth.Account> {
    const account = await this.authService.getAccountById(request.userId);
    return {
      id: account.id,
      fullName: account.fullName,
      email: account.email,
    };
  }
}
