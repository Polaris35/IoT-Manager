import { DeviceProtocol } from '@iot-manager/nest-libs';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';

export class SearchProfileDto {
  @ApiPropertyOptional({
    description: 'Search field (device name or vendor)',
    example: 'Sonoff',
  })
  @IsString()
  @MinLength(2)
  q: string;

  @ApiPropertyOptional({
    description: 'Filter by protocol',
    enum: DeviceProtocol,
  })
  @IsOptional()
  @IsEnum(DeviceProtocol)
  protocol: DeviceProtocol;

  @ApiPropertyOptional({
    default: 20,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit: number;
}
