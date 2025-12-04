import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class RefreshTokensDto {
  @ApiProperty({ example: "Google chrome" })
  @IsNotEmpty()
  @IsString()
  agent: string;

  @ApiProperty({
    example: "refreshToken",
  })
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}
