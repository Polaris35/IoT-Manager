import { Controller, Logger } from '@nestjs/common';
import {
  Ctx,
  EventPattern,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';
import { TelemetryData, TelemetryService } from './telemetry.service';
import { Channel, Message } from 'amqplib';

@Controller()
export class TelemetryController {
  private readonly logger = new Logger(TelemetryController.name);
  constructor(private readonly telemetryService: TelemetryService) {}

  @EventPattern('telemetry.created')
  handleTelemetry(@Payload() data: TelemetryData, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef() as Channel;
    const originalMsg = context.getMessage() as Message;

    try {
      this.telemetryService.addTelemetry(data);
      channel.ack(originalMsg);
    } catch (error: any) {
      this.logger.error(`Error saving telemetry: `, error);
      channel.nack(originalMsg);
    }
  }

  @MessagePattern('get_device_stats')
  getDeviceStats(
    @Payload() data: { deviceId: string; range?: string },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @Ctx() context: RmqContext,
  ) {
    const range = data.range || '-1h';

    this.logger.log(`Fetching stats for ${data.deviceId} (Range: ${range})`);

    return this.telemetryService.getDeviceStats(data.deviceId, range);
  }

  @MessagePattern('get_latest_anchored_metrics')
  getLatestAnchoredMetrics(
    @Payload() data: { deviceId: string; range?: string; metricName: string },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @Ctx() context: RmqContext,
  ) {
    const range = data.range || '6h';
    return this.telemetryService.getLatestAnchoredMetrics(
      data.deviceId,
      data.metricName,
      range,
    );
  }
}
