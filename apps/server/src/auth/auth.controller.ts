import { Body, Controller, Post, UseInterceptors } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterAccountDto } from '@iot-manager/nest-libs/dto';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { GrpcToHttpInterceptor } from 'nestjs-grpc-exceptions';

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
}
