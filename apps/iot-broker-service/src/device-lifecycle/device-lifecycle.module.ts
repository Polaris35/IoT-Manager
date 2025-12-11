import { Module } from '@nestjs/common';
import { DeviceLifecycleController } from './device-lifecycle.controller';
import { DeviceLifecycleService } from './device-lifecycle.service';
import { MqttModule } from '../protocols/mqtt/mqtt.module';

@Module({
  imports: [MqttModule],
  controllers: [DeviceLifecycleController],
  providers: [DeviceLifecycleService],
})
export class DeviceLifecycleModule {}
