import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

// --- MQTT ---
export class MqttConnectionConfigDto {
  @ApiProperty({
    description: 'Topic for receiving state updates',
    example: 'devices/mqtt-light-01/state',
  })
  @IsString()
  @IsNotEmpty()
  stateTopic: string;

  @ApiProperty({
    description: 'Topic for sending commands (optional)',
    example: 'devices/mqtt-light-01/command',
    required: false,
  })
  @IsString()
  @IsOptional()
  commandTopic?: string;
}

// --- ZIGBEE ---
export class ZigbeeConnectionConfigDto {
  @ApiProperty({
    description: 'MQTT prefix for Zigbee2MQTT (default: zigbee2mqtt)',
    example: 'zigbee2mqtt',
    required: false,
  })
  @IsString()
  @IsOptional()
  topicPrefix?: string;
}

// --- TUYA ---
export class TuyaConnectionConfigDto {
  @ApiProperty({
    description: 'Product ID from Tuya Cloud',
    example: 'p123456789',
  })
  @IsString()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({
    description: 'User ID (uid) from Tuya Cloud context',
    example: 'ay123456...',
    required: false,
  })
  @IsString()
  @IsOptional()
  uid?: string;
}
