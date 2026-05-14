import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterAccountDto {
  @IsString()
  @ApiProperty({
    example: 'Lohn Doe',
    minLength: 2,
  })
  @IsNotEmpty()
  fullName: string;

  @IsEmail()
  @ApiProperty({ example: 'ikozluk160@gmail.com', format: 'email' })
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(4)
  @ApiProperty({ example: '12345', minLength: 4 })
  @IsNotEmpty()
  password: string;
}
