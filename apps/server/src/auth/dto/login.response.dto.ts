import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { AccountResponseDto } from './account.response.dto';

export class LoginResponseDto {
  @ApiProperty({
    description: 'User account details',
    type: AccountResponseDto,
  })
  @Expose()
  @Type(() => AccountResponseDto)
  account: AccountResponseDto;

  @ApiProperty({
    description: 'JWT Access Token (short-lived)',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @Expose()
  accessToken: string;

  @ApiProperty({
    description: 'Refresh Token (long-lived, used to renew access token)',
    example: 'd9b2d63d-a23df-4f32-b342...',
  })
  @Expose()
  refreshToken: string;
}
