import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload, Ctx, RmqContext } from '@nestjs/microservices';
import { InfluxDbService } from '../influxdb/influxdb.service';
import { Point } from '@influxdata/influxdb-client';
import { Channel, Message } from 'amqplib';

// DTO for incoming telemetry data from RabbitMQ
interface TelemetryData {
  deviceId: string;
  timestamp: string; // ISO String date
  metricType: string;
  value: number;
}

@Controller()
export class CollectorController {
  private readonly logger = new Logger(CollectorController.name);

  constructor(private readonly influxService: InfluxDbService) {}

  /**
   * Handles 'telemetry.created' events from IoT Broker Service.
   * Pattern: Fire-and-Forget (Event based).
   */
  @EventPattern('telemetry.created')
  handleTelemetry(@Payload() data: TelemetryData, @Ctx() context: RmqContext) {
    // Type assertion for amqplib objects to access .ack() / .nack()
    const channel = context.getChannelRef() as Channel;
    const originalMsg = context.getMessage() as Message;

    try {
      console.log('Received telemetry data: ', data);
      // Create InfluxDB Point
      // Measurement: 'device_metrics' (like a table name)
      const point = new Point('device_metrics')
        // Tags: Indexed columns for fast filtering (WHERE clause)
        .tag('deviceId', data.deviceId)
        .tag('metric', data.metricType)
        // Fields: Actual values (not indexed, used for calculations)
        .floatField('value', data.value)
        // Timestamp: Ensure we use the device's time, not server processing time
        .timestamp(new Date(data.timestamp));

      // Write to buffer
      this.influxService.writePoint(point);

      // this.logger.debug(`Queued metric ${data.metricType} for device ${data.deviceId}`);

      // Acknowledge message processing to RabbitMQ
      channel.ack(originalMsg);
    } catch (error: any) {
      this.logger.error(`Error saving telemetry: `, error);

      // If DB write fails, we reject the message so it doesn't get lost
      // (or use Dead Letter Queue in production)
      channel.nack(originalMsg);
    }
  }
}
