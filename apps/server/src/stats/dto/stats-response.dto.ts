import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class StatsResponseDto {
  @ApiProperty()
  @Expose()
  timestamp: string;

  @ApiProperty({ oneOf: [{ type: 'string' }, { type: 'number' }] })
  @Expose()
  value: string | number;
}
