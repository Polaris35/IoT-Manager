import { Controller } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AccountProvider } from '@entities';
import { TokenService } from '@tokens/token.service';
import { GrpcMethod } from '@nestjs/microservices';
import type {
  AuthServiceController,
  CredentialsLoginDto,
  LoginResponse,
  LogoutDto,
  RefreshTokensDto,
  RegisterDto,
} from '@iot-manager/proto';
import { AUTH_SERVICE_NAME, ResponseStatus } from '@iot-manager/proto';
import {
  GrpcInvalidArgumentException,
  GrpcUnknownException,
} from 'nestjs-grpc-exceptions';

@Controller()
export class AuthController implements AuthServiceController {
  constructor(
    private readonly authService: AuthService,
    private readonly tokenService: TokenService,
  ) {}

  @GrpcMethod(AUTH_SERVICE_NAME)
  async credentialsRegister(dto: RegisterDto) {
    const account = await this.authService.register(dto);

    if (!account) {
      throw new GrpcUnknownException(
        `Can't registrate account ${JSON.stringify(dto)}`,
      );
    }
    return {
      status: ResponseStatus.OK,
    };
  }

  @GrpcMethod(AUTH_SERVICE_NAME)
  async credentialsLogin(dto: CredentialsLoginDto): Promise<LoginResponse> {
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

  @GrpcMethod(AUTH_SERVICE_NAME)
  async logout(dto: LogoutDto) {
    if (!dto) {
      throw new GrpcInvalidArgumentException('refreshToken is required');
    }
    await this.tokenService.deleteRefreshToken(dto.refreshToken);

    return {
      status: ResponseStatus.OK,
    };
  }

  @GrpcMethod(AUTH_SERVICE_NAME)
  async refreshTokens(dto: RefreshTokensDto) {
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
    return {
      accessToken: tokens.accessToken,
      refreshToken: {
        ...tokens.refreshToken,
        expInISOString: tokens.refreshToken.exp.toISOString(),
      },
    };
  }
}
