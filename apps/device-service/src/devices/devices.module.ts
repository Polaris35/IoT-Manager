import { Module } from '@nestjs/common';
import { DevicesController } from './devices.controller';
import { DevicesService } from './devices.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeviceEntity, DeviceProfileEntity } from '@entities';

@Module({
  controllers: [DevicesController],
  providers: [DevicesService],
  imports: [TypeOrmModule.forFeature([DeviceEntity, DeviceProfileEntity])],
})
export class DevicesModule {}
