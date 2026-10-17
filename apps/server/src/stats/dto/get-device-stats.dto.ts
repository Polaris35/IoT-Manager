import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export const METRIC_RANGES = ['15m', '1h', '6h', '24h', '7d'] as const;
export type MetricRangeType = (typeof METRIC_RANGES)[number];

export class GetDeviceStatsDto {
  @ApiProperty({
    enum: METRIC_RANGES,
    enumName: 'MetricRange',
    description: 'Time window duration anchored to latest data',
    default: '6h',
    example: '6h',
    required: false,
  })
  @IsIn(METRIC_RANGES)
  @IsOptional()
  range: MetricRangeType = '6h';

  @ApiProperty({
    description: 'Unique identifier of the target device',
    format: 'uuid',
    example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  })
  @IsUUID('4', { message: 'deviceId must be a valid UUID v4' })
  @IsNotEmpty()
  deviceId: string;

  @ApiProperty({
    description: 'Telemetry metric tag key stored in InfluxDB',
    example: 'temperature',
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @IsNotEmpty({ message: 'metricName cannot be empty' })
  metricName: string;
}
