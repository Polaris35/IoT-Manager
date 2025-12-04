import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class GoogleLoginDto {
  @ApiProperty({
    description: 'Authorization code received from Google',
    example: '4/0AfJohXLc...',
  })
  @IsString()
  @IsNotEmpty()
  code: string;
}
