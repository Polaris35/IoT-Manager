import {
  BadRequestException,
  Body,
  Controller,
  Post,
  UseInterceptors,
  Headers,
  Query,
  Get,
  UnauthorizedException,
} from '@nestjs/common';
import { RegisterAccountDto } from './dto/register.dto';
import { AuthService } from './auth.service';
import { AccountProvider } from '@entities';
import { CredentialsLoginDto } from './dto/login.dto';
import { TokenService } from '@tokens/token.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly tokenService: TokenService,
  ) {}

  @Post('credentials/register')
  async CredentialsRegister(@Body() dto: RegisterAccountDto) {
    const user = await this.authService.register(dto);
    console.log(user);
    if (!user) {
      throw new BadRequestException(
        `Can't registrate user ${JSON.stringify(dto)}`,
      );
    }
  }

  @Post('credentials/login')
  async credentialsLogin(
    @Body() dto: CredentialsLoginDto,
    @Headers('user-agent') agent: string,
  ) {
    console.log(dto);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    const userWithTokens = await this.authService.authorize(
      dto,
      agent,
      AccountProvider.CREDENTIALS,
    );
    if (!userWithTokens) {
      throw new BadRequestException(`Can't login user`);
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    return { user: userWithTokens.user, tokens: userWithTokens.tokens };
  }

  @Get('logout')
  async logout(@Query('refreshToken') refreshToken: string) {
    if (!refreshToken) {
      throw new BadRequestException('refreshToken is required');
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    await this.tokenService.deleteRefreshToken(refreshToken);
  }

  @Get('refresh-tokens')
  async refreshTokens(
    @Query('refreshToken') refreshToken: string,
    @Headers('user-agent') agent: string,
  ) {
    console.log(refreshToken);
    if (!refreshToken) {
      throw new UnauthorizedException();
    }
    const tokens = await this.tokenService.refreshToken(refreshToken, agent);
    if (!tokens) {
      throw new UnauthorizedException("Can't update refresh token");
    }
    return tokens;
  }
}
