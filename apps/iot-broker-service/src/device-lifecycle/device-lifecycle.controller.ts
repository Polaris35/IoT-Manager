import { Controller } from '@nestjs/common';
import {
  EventPattern,
  Payload,
  Ctx,
  RmqContext,
  MessagePattern,
} from '@nestjs/microservices';
import { DeviceLifecycleService } from './device-lifecycle.service';
import {
  DeviceCreatedEventDto,
  DeviceCurrentMetricsGetEventDto,
} from '@iot-manager/nest-libs';
import { Channel, Message } from 'amqplib';

@Controller()
export class DeviceLifecycleController {
  constructor(private readonly service: DeviceLifecycleService) {}

  @EventPattern('device.created')
  handleDeviceCreated(
    @Payload() data: DeviceCreatedEventDto,
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef() as Channel;
    const originalMsg = context.getMessage() as Message;

    try {
      console.log(`[Event] New Device Created: ${data.id}`);

      this.service.registerNewDevice(data);
      channel.ack(originalMsg);
    } catch (error) {
      console.error('Error processing device event', error);
      // channel.nack(originalMsg);
    }
  }

  @MessagePattern('device.current-metrics.get')
  async getDeviceCurrentMetrics(
    @Payload() data: DeviceCurrentMetricsGetEventDto,
    @Ctx() context: RmqContext,
  ) {
    const metrics = await this.service.getCurrentMetrics(data.deviceId);

    const channel = context.getChannelRef() as Channel;
    const originalMsg = context.getMessage() as Message;

    channel.ack(originalMsg);

    return {
      metrics,
    };
  }
}
