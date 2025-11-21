// // apps/api-gateway/src/modules/device/dto/create-device.dto.ts

// import { ApiProperty } from '@nestjs/swagger';
// import {
//   IsEnum,
//   IsNotEmpty,
//   IsObject,
//   IsOptional,
//   IsString,
//   IsUUID,
//   ValidateNested,
// } from 'class-validator';
// import { Type } from 'class-transformer';
// import {
//   MqttConnectionConfigDto,
//   ZigbeeConnectionConfigDto,
//   TuyaConnectionConfigDto,
// } from './connection-configs.dto';

// export enum DeviceProtocol {
//   MQTT = 'MQTT',
//   ZIGBEE = 'ZIGBEE',
//   TUYA = 'TUYA',
// }

// export class CreateDeviceDto {
//   @ApiProperty({
//     description: 'User-defined name for the device',
//     example: 'Гостиная: торшер',
//   })
//   @IsString()
//   @IsNotEmpty()
//   name: string;

//   @ApiProperty({
//     enum: DeviceProtocol,
//     description: 'The communication protocol of the device',
//     example: DeviceProtocol.MQTT,
//   })
//   @IsEnum(DeviceProtocol)
//   protocol: DeviceProtocol;

//   @ApiProperty({
//     required: false,
//     description: 'ID of the group this device belongs to',
//     example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
//   })
//   @IsUUID()
//   @IsOptional()
//   groupId?: string;

//   @ApiProperty({
//     description:
//       'Protocol-specific connection settings. The structure depends on the `protocol` field.',
//     oneOf: [
//       { $ref: '#/components/schemas/MqttConnectionConfigDto' },
//       { $ref: '#/components/schemas/ZigbeeConnectionConfigDto' },
//       { $ref: '#/components/schemas/TuyaConnectionConfigDto' },
//     ],
//   })
//   @IsObject()
//   @ValidateNested()
//   @Type(({ object }) => {
//     switch (object.protocol) {
//       case DeviceProtocol.MQTT:
//         return MqttConnectionConfigDto;
//       case DeviceProtocol.ZIGBEE:
//         return ZigbeeConnectionConfigDto;
//       case DeviceProtocol.TUYA:
//         return TuyaConnectionConfigDto;
//       default:
//         // Позволяет добавить протокол, не требующий connectionConfig,
//         // не ломая валидацию.
//         return EmptyConfig;
//     }
//   })
//   connectionConfig:
//     | MqttConnectionConfigDto
//     | ZigbeeConnectionConfigDto
//     | TuyaConnectionConfigDto;
// }

// class EmptyConfig {}
