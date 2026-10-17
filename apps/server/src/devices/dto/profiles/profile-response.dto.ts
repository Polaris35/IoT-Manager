import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class ProfileResponseDto {
  @ApiProperty({ example: 'prof_wifi_sonoff_basic' })
  @Expose()
  id: string;

  @ApiProperty({ example: 'Sonoff Basic R2' })
  @Expose()
  name: string;

  @ApiProperty({ example: 'Sonoff' })
  @Expose()
  vendor: string;

  @ApiProperty({ example: 'MQTT' })
  @Expose()
  protocol: string;

  @ApiProperty({ example: 'Tasmota relay', required: false })
  @Expose()
  description: string;

  @ApiProperty({
    description: 'mapping of metrics of device',
  })
  @Expose()
  mappings: string;

  @ApiProperty({
    description: 'mapping of commands for device',
    required: false,
  })
  @Expose()
  commands: string;

  @ApiProperty({ example: 'JSON' })
  @Expose()
  commandMode: string;
}
