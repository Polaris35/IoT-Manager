import { Controller, Logger } from '@nestjs/common';
import {
  EventPattern,
  Payload,
  Ctx,
  RmqContext,
  MessagePattern,
} from '@nestjs/microservices';
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
  @MessagePattern('get_device_stats')
  async getDeviceStats(
    @Payload() data: { deviceId: string; range?: string },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @Ctx() context: RmqContext,
  ) {
    // В паттерне Request-Response (MessagePattern) ручной ack обычно не нужен,
    // NestJS сам отправит ответ в reply-to очередь.

    const range = data.range || '-1h'; // Default: last hour

    this.logger.log(`Fetching stats for ${data.deviceId} (Range: ${range})`);

    // Flux query to fetch data from InfluxDB
    const query = `
      from(bucket: "${process.env.INFLUXDB_BUCKET}")
        |> range(start: ${range})
        |> filter(fn: (r) => r["_measurement"] == "device_metrics")
        |> filter(fn: (r) => r["deviceId"] == "${data.deviceId}")
        |> pivot(rowKey:["_time"], columnKey: ["_field"], valueColumn: "_value")
        |> sort(columns: ["_time"], desc: false)
    `;

    try {
      const rows = await this.influxService.query(query);

      // Map raw InfluxDB rows to clean JSON
      return rows.map((row) => ({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        timestamp: row._time,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        metric: row.metric,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        value: row.value,
      }));
    } catch (error) {
      this.logger.error(`Failed to fetch stats: `, error);
      return []; // Return empty array on error
    }
  }
}
