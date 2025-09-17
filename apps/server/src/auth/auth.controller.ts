import { Body, Controller, Post, UseInterceptors } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  CredentialsLoginDto,
  RegisterAccountDto,
  LogoutDto,
  RefreshTokensDto,
} from '@iot-manager/nest-libs/dto';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { GrpcToHttpInterceptor } from 'nestjs-grpc-exceptions';
import { UserAgent } from '@iot-manager/nest-libs/decorators';

@ApiTags('cats')
@Controller('auth')
@UseInterceptors(new GrpcToHttpInterceptor())
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiResponse({
    status: 201,
    description: 'The account has been successfully registered.',
  })
  @Post('credentials/register')
  credentialsRegister(@Body() dto: RegisterAccountDto) {
    return this.authService.credentialsRegister(dto);
  }

  @Post('credentials/login')
  credentialsLogin(
    @Body() dto: CredentialsLoginDto,
    @UserAgent() agent: string,
  ) {
    return this.authService.credentialsLogin(dto, agent);
  }

  @Post('logout')
  logout(@Body() logoutDto: LogoutDto) {
    this.authService.logout(logoutDto);
  }

  @Post('refresh-tokens')
  async refreshTokens(@Body() refreshTokensDto: RefreshTokensDto) {
    console.log(refreshTokensDto);
    return await this.authService.refreshTokens(refreshTokensDto);
  }
}
