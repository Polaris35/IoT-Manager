import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterAccountDto } from '@iot-manager/nest-libs/dto';
import { ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('cats')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiResponse({
    status: 201,
    description: 'The account has been successfully registered.',
  })
  @Post('credentials/register')
  credentialsLogin(@Body() dto: RegisterAccountDto, agent: string) {
    this.authService.credentialsLogin(dto, agent);
  }
}
