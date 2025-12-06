import { ApiExtraModels, ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Type, TypeHelpOptions } from 'class-transformer';
import {
  MqttConnectionConfigDto,
  ZigbeeConnectionConfigDto,
  TuyaConnectionConfigDto,
} from './connection-configs.dto';
import { DeviceProtocol } from '@iot-manager/nest-libs';

class EmptyConfig {}
@ApiExtraModels(
  MqttConnectionConfigDto,
  ZigbeeConnectionConfigDto,
  TuyaConnectionConfigDto,
  EmptyConfig,
)
export class CreateDeviceDto {
  @ApiProperty({
    description: 'User-defined name for the device',
    example: 'Гостиная: торшер',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    enum: DeviceProtocol,
    description: 'Communication protocol of the device',
    example: DeviceProtocol.MQTT,
  })
  @IsEnum(DeviceProtocol)
  protocol: DeviceProtocol;

  @ApiProperty({
    description: 'UUID of the device profile (template)',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  })
  @IsString()
  @IsNotEmpty()
  profileId: string;

  @ApiProperty({
    description: 'Unique hardware ID (Topic, MAC, DevID)',
    example: 'my_home/livingroom/light',
  })
  @IsString()
  @IsNotEmpty()
  externalId: string;

  @ApiProperty({
    required: false,
    description: 'ID of the group this device belongs to',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  })
  @IsUUID()
  @IsOptional()
  groupId?: string;

  @ApiProperty({
    description:
      'Protocol-specific connection settings. The structure depends on the `protocol` field.',
    oneOf: [
      { $ref: '#/components/schemas/MqttConnectionConfigDto' },
      { $ref: '#/components/schemas/ZigbeeConnectionConfigDto' },
      { $ref: '#/components/schemas/TuyaConnectionConfigDto' },
    ],
  })
  @IsObject()
  @ValidateNested()
  @Type((options: TypeHelpOptions) => {
    const dto = options.object as CreateDeviceDto;

    switch (dto.protocol) {
      case DeviceProtocol.MQTT:
        return MqttConnectionConfigDto;
      case DeviceProtocol.ZIGBEE:
        return ZigbeeConnectionConfigDto;
      case DeviceProtocol.TUYA:
        return TuyaConnectionConfigDto;
      default:
        return EmptyConfig;
    }
  })
  connectionConfig:
    | MqttConnectionConfigDto
    | ZigbeeConnectionConfigDto
    | TuyaConnectionConfigDto;
}
