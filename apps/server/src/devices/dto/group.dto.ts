import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

// --- CREATE GROUP DTO ---
export class CreateGroupDto {
  @ApiProperty({
    description: 'The name of the group (e.g., room name)',
    example: 'Living Room',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  name: string;

  @ApiPropertyOptional({
    description: 'Optional description of the group',
    example: 'Devices located on the first floor',
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  description?: string;
}

// --- UPDATE GROUP DTO ---
export class UpdateGroupDto extends PartialType(CreateGroupDto) {}

// --- GROUP RESPONSE DTO ---
export class DeviceGroupResponseDto {
  @ApiProperty({ example: 'b1234567-c890-1234-5678-90abcdef1234' })
  id: string;

  @ApiProperty({ example: 'Living Room' })
  name: string;

  @ApiPropertyOptional({ example: 'Devices located on the first floor' })
  description?: string;

  @ApiProperty({ example: '2025-11-28T12:00:00Z' })
  createdAt: Date;

  // This is crucial for rendering.
  // It allows the frontend to show a badge like "Living Room (5 devices)"
  // without downloading the actual list of devices.
  @ApiProperty({
    example: 5,
    description: 'Total number of devices in this group',
  })
  devicesCount: number;
}
