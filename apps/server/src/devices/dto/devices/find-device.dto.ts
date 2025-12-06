import { DeviceProtocol } from '@iot-manager/nest-libs';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsUUID, Min } from 'class-validator';

export class FindDevicesDto {
  @ApiPropertyOptional({ description: 'Номер страницы', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Количество на странице', default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Фильтр по протоколу',
    enum: DeviceProtocol,
  })
  @IsOptional()
  @IsEnum(DeviceProtocol)
  protocol?: DeviceProtocol;

  @ApiPropertyOptional({ description: 'ID группы' })
  @IsOptional()
  @IsUUID()
  groupId?: string;
}
