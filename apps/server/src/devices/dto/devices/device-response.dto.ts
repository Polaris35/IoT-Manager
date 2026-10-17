import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class DeviceResponseDto {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  name: string;

  @ApiProperty()
  @Expose()
  externalId: string;

  @ApiProperty()
  @Expose()
  profileId: string;

  @ApiProperty()
  @Expose()
  protocol: string;

  @ApiProperty()
  @Expose()
  userId: string;

  @ApiProperty()
  @Expose()
  connectionConfig: string;
}
