import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class MqttConnectionConfigDto {
  @ApiProperty({
    description: 'Topic for sending commands',
    example: 'devices/mqtt-light-01/command',
  })
  @IsString()
  @IsNotEmpty()
  commandTopic: string;

  @ApiProperty({
    description: 'Topic for receiving state updates',
    example: 'devices/mqtt-light-01/state',
  })
  @IsString()
  @IsNotEmpty()
  stateTopic: string;
}

export class ZigbeeConnectionConfigDto {
  @ApiProperty({
    description: 'User-friendly name from Zigbee2MQTT',
    example: 'living_room_light',
  })
  @IsString()
  @IsNotEmpty()
  friendlyName: string;
}

export class TuyaConnectionConfigDto {
  @ApiProperty({
    description: 'Device asset ID from Tuya Cloud',
    example: 'vdevo123456789',
  })
  @IsString()
  @IsNotEmpty()
  assetId: string;

  @ApiProperty({
    description: 'Product ID from Tuya Cloud',
    example: 'p123456789',
  })
  @IsString()
  @IsNotEmpty()
  productId: string;
}
