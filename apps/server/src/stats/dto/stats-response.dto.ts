import { ApiProperty } from '@nestjs/swagger';

export class StatsResponseDto {
  @ApiProperty()
  timestamp: string;
  @ApiProperty({ oneOf: [{ type: 'string' }, { type: 'number' }] })
  value: string | number;
}
