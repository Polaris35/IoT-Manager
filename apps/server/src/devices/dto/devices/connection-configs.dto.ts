import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

// --- MQTT ---
// stateTopic обязателен (иначе мы не получим данные).
// commandTopic опционален (у датчиков его нет).
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
// friendlyName удален, так как он берется из externalId.
// Добавлен topicPrefix на случай, если в Zigbee2MQTT изменен базовый топик.
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
// assetId (Device ID) удален, так как он берется из externalId.
// productId нужен для идентификации типа устройства.
// uid полезен для API запросов, но сделаем опциональным.
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
