import { Module } from '@nestjs/common';
import { DevicesController } from './devices.controller';
import { DevicesService } from './devices.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeviceEntity, DeviceProfileEntity, GroupEntity } from '@entities';
import { GroupsService } from './groups.service';
import { GroupsController } from './groups.controller';

@Module({
  controllers: [DevicesController, GroupsController],
  providers: [DevicesService, GroupsService],
  imports: [
    TypeOrmModule.forFeature([DeviceEntity, DeviceProfileEntity, GroupEntity]),
  ],
})
export class DevicesModule {}
