import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CredentialsLoginDto {
  @IsEmail()
  @ApiProperty({
    example: 'example@gmail.com',
    format: 'email',
  })
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(4)
  @ApiProperty({ example: '12345', minLength: 4 })
  @IsNotEmpty()
  password: string;
}

export class ProvidersLoginDto {
  accessGrantToken: string;
}

export type LoginDto = CredentialsLoginDto | ProvidersLoginDto;
