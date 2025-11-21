import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, IsNotEmpty } from 'class-validator';

export class UpdateDeviceDto {
  @ApiPropertyOptional({
    description: 'New name for the device',
    example: 'Спальня: ночник',
  })
  @IsString()
  @IsNotEmpty() // Если поле передано, оно не должно быть пустым
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    description:
      'New group ID for the device. Send `null` to remove from group.',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
    nullable: true,
  })
  @IsUUID()
  @IsOptional()
  groupId?: string | null;
}
