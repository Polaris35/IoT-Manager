import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString, MinLength } from "class-validator";

export class RegisterAccountDto {
  @IsString()
  @ApiProperty({
    example: "Lohn Doe",
  })
  @IsNotEmpty()
  fullName: string;

  @IsEmail()
  @ApiProperty({ example: "ikozluk160@gmail.com" })
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(4)
  @ApiProperty({ example: "12345" })
  @IsNotEmpty()
  password: string;
}
