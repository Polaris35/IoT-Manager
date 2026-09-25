import { ApiProperty, OmitType } from '@nestjs/swagger';
import { DeviceResponseDto } from './device-response.dto';
import { Expose, Type } from 'class-transformer';

export class DeviceListItemDto extends OmitType(DeviceResponseDto, [
  'connectionConfig',
  'externalId',
  'profileId',
  'userId',
] as const) {
  @ApiProperty({
    additionalProperties: {
      oneOf: [{ type: 'string' }, { type: 'number' }],
    },
  })
  @Expose()
  metrics: Record<string, string | number>;
}

export class DevicesListDto {
  @ApiProperty({ example: 42, description: 'Total count of devices' })
  @Expose()
  total: number;

  @ApiProperty({ type: [DeviceListItemDto], description: 'Device list' })
  @Expose()
  @Type(() => DeviceListItemDto)
  devices: DeviceListItemDto[];
}
