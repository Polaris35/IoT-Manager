import { Body, Controller, Get, Post, UseInterceptors } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GrpcToHttpInterceptor } from 'nestjs-grpc-exceptions';
import {
  CurrentUser,
  Public,
  UserAgent,
} from '@iot-manager/nest-libs/decorators';
import {
  CredentialsLoginDto,
  LogoutDto,
  RefreshTokensDto,
  RegisterAccountDto,
} from './dto';
import { LoginResponseDto } from './dto/login.response.dto';
import { plainToInstance } from 'class-transformer';
import { RefreshTokensResponseDto } from './dto/refresh-tokens.response.dto';
import { AccountResponseDto } from './dto/account.response.dto';

@ApiTags('auth')
@Controller('auth')
@UseInterceptors(new GrpcToHttpInterceptor())
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Register a new account with email and password' })
  @ApiResponse({
    status: 201,
    description: 'The account has been successfully registered.',
  })
  @Public()
  @Post('credentials/register')
  credentialsRegister(@Body() dto: RegisterAccountDto) {
    return this.authService.credentialsRegister(dto);
  }

  @ApiOperation({ summary: 'Login with email and password' })
  @ApiResponse({
    status: 200,
    description: 'Returns tokens and user info',
    type: LoginResponseDto,
  })
  @Public()
  @Post('credentials/login')
  async credentialsLogin(
    @Body() dto: CredentialsLoginDto,
    @UserAgent() agent: string,
  ) {
    const loginData = await this.authService.credentialsLogin(dto, agent);
    return plainToInstance(LoginResponseDto, loginData, {
      excludeExtraneousValues: true,
    });
  }

  @ApiOperation({ summary: 'Logout from the system' })
  @Public()
  @Post('logout')
  logout(@Body() logoutDto: LogoutDto) {
    this.authService.logout(logoutDto);
  }

  @ApiOperation({ summary: 'Refresh access and refresh tokens' })
  @ApiResponse({
    status: 200,
    description: 'Returns access  and refresh tokens',
    type: RefreshTokensResponseDto,
  })
  @Public()
  @Post('refresh-tokens')
  async refreshTokens(@Body() refreshTokensDto: RefreshTokensDto) {
    const tokens = await this.authService.refreshTokens(refreshTokensDto);
    return plainToInstance(RefreshTokensResponseDto, tokens, {
      excludeExtraneousValues: true,
    });
  }

  @ApiOperation({ summary: 'Get current user account info' })
  @ApiResponse({
    status: 200,
    description: 'Returns user account information',
    type: AccountResponseDto,
  })
  @Get('account-info')
  async accountInfo(@CurrentUser('id') userId: string) {
    const accountInfo = await this.authService.getAccountInfo(userId);
    return plainToInstance(AccountResponseDto, accountInfo, {
      excludeExtraneousValues: true,
    });
  }
}
