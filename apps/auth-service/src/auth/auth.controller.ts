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

  @GrpcMethod(auth.AUTH_SERVICE_NAME)
  async credentialsRegister(dto: auth.RegisterRequest) {
    const account = await this.authService.register(dto);

    if (!account) {
      throw new GrpcUnknownException(
        `Can't registrate account ${JSON.stringify(dto)}`,
      );
    }
    return {
      status: auth.ResponseStatus.OK,
    };
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

  @GrpcMethod(auth.AUTH_SERVICE_NAME)
  async logout(dto: auth.LogoutRequest) {
    if (!dto) {
      throw new GrpcInvalidArgumentException('refreshToken is required');
    }
    const rezult = await this.tokenService.deleteRefreshToken(dto.refreshToken);
    console.log(rezult);

    return {
      status: auth.ResponseStatus.OK,
    };
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
    return {
      accessToken: tokens.accessToken,
      refreshToken: {
        ...tokens.refreshToken,
        expInISOString: tokens.refreshToken.exp.toISOString(),
      },
    };
  }

  @GrpcMethod(auth.AUTH_SERVICE_NAME)
  async validateAccessToken(request: auth.ValidateTokenRequest) {
    return this.tokenService.validateAccessToken(request.accessToken);
  }
}
