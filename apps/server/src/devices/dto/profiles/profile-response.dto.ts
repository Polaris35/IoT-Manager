import { ApiProperty } from '@nestjs/swagger';

export class ProfileResponseDto {
  @ApiProperty({ example: 'prof_wifi_sonoff_basic' })
  id: string;

  @ApiProperty({ example: 'Sonoff Basic R2' })
  name: string;

  @ApiProperty({ example: 'Sonoff' })
  vendor: string;

  @ApiProperty({ example: 'WIFI' })
  protocol: string;

  @ApiProperty({ example: 'Реле Tasmota', required: false })
  description: string;

  // Mappings в списке поиска обычно не нужны, поэтому скрываем или делаем optional
}
