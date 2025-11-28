import { Module } from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import { DeviceEntity, DeviceProfileEntity } from '@entities';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfilesController } from './profiles.controller';

@Module({
  imports: [TypeOrmModule.forFeature([DeviceProfileEntity])],
  providers: [ProfilesService],
  controllers: [ProfilesController],
})
export class ProfilesModule {}
