import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MinLength } from 'class-validator';

// Твой Enum протоколов (лучше вынести в shared, но можно и продублировать)
export enum DeviceProtocol {
  MQTT = 'MQTT',
  ZIGBEE = 'ZIGBEE',
  TUYA = 'TUYA',
  WIFI = 'WIFI',
  HTTP = 'HTTP',
}

export class SearchProfileDto {
  @ApiPropertyOptional({
    description: 'Поисковая строка (имя устройства или вендор)',
    example: 'Sonoff',
  })
  @IsOptional()
  @IsString()
  @MinLength(2) // Не искать по 1 букве
  q?: string;

  @ApiPropertyOptional({
    description: 'Фильтр по протоколу',
    enum: DeviceProtocol,
  })
  @IsOptional()
  @IsEnum(DeviceProtocol)
  protocol?: DeviceProtocol;
}
