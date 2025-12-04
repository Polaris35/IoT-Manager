import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class AccountResponseDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Unique identifier of the user',
  })
  @Expose()
  id: string;

  @ApiProperty({
    example: 'John Doe',
    description: 'Full name of the user',
  })
  @Expose()
  fullName: string;

  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'User email address',
  })
  @Expose()
  email: string;
}
