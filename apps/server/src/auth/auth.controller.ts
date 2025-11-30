import {
  Body,
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from './guards';
import {
  CredentialsLoginDto,
  RegisterAccountDto,
  LogoutDto,
  RefreshTokensDto,
} from '@iot-manager/nest-libs/dto';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GrpcToHttpInterceptor } from 'nestjs-grpc-exceptions';
import {
  CurrentUser,
  Public,
  UserAgent,
} from '@iot-manager/nest-libs/decorators';

@Public()
@ApiTags('auth')
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
  refreshTokens(@Body() refreshTokensDto: RefreshTokensDto) {
    return this.authService.refreshTokens(refreshTokensDto);
  }

  @Post('test-protected-router')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  testProtectedRoute(@CurrentUser('id') id: string) {
    console.log('this is protected route, current user id: ', id);
    return id;
  }
}
