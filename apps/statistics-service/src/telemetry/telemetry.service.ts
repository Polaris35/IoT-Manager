import { Point } from '@influxdata/influxdb-client';
import { Injectable, Logger } from '@nestjs/common';
import { InfluxDbService } from 'src/influxdb/influxdb.service';

export interface TelemetryData {
  deviceId: string;
  timestamp: string; // ISO String date
  metricType: string;
  value: number;
}

@Injectable()
export class TelemetryService {
  private readonly logger = new Logger(TelemetryService.name);

  constructor(private readonly influxService: InfluxDbService) {}

  addTelemetry(data: TelemetryData) {
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
  }

  async getDeviceStats(deviceId: string, range: string) {
    // Flux query to fetch data from InfluxDB
    const query = `
        from(bucket: "${process.env.INFLUXDB_BUCKET}")
          |> range(start: ${range})
          |> filter(fn: (r) => r["_measurement"] == "device_metrics")
          |> filter(fn: (r) => r["deviceId"] == "${deviceId}")
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
