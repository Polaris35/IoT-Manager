import { Controller } from '@nestjs/common';
import { EventPattern, Payload, Ctx, RmqContext } from '@nestjs/microservices';
import { DeviceLifecycleService } from './device-lifecycle.service';
import { DeviceCreatedEventDto } from '@iot-manager/nest-libs';
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

      // Важно: подтверждаем обработку
      channel.ack(originalMsg);
    } catch (error) {
      console.error('Error processing device event', error);
      // Если ошибка - возвращаем в очередь или удаляем
      // channel.nack(originalMsg);
    }
  }
}
