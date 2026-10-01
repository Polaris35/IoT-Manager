import { Point } from '@influxdata/influxdb-client';
import { Injectable, Logger } from '@nestjs/common';
import { InfluxDbService } from 'src/influxdb/influxdb.service';

export interface TelemetryData {
  deviceId: string;
  timestamp: string; // ISO String date
  metricType: string;
  value: number;
}

export interface MetricPointDto {
  timestamp: string; // ISO 8601 string
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
        from(bucket: "${this.influxService.bucketName}")
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
  async getLatestAnchoredMetrics(
    deviceId: string,
    metric: string,
    range: string = '1h',
  ): Promise<MetricPointDto[]> {
    const bucket = this.influxService.bucketName;
    const interval = this.resolveInterval(range);

    // 1. Fetch only the single latest timestamp
    const latestQuery = `
      from(bucket: "${bucket}")
        |> range(start: -30d)
        |> filter(fn: (r) => r._measurement == "device_metrics")
        |> filter(fn: (r) => r.deviceId == "${deviceId}")
        |> filter(fn: (r) => r.metric == "${metric}")
        |> filter(fn: (r) => r._field == "value")
        |> last()
        |> keep(columns: ["_time"])
    `;

    const latestRows = await this.influxService.query(latestQuery);
    if (!latestRows || latestRows.length === 0) {
      return []; // No telemetry ever recorded for this device/metric
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const latestTime = latestRows[0]._time; // e.g. "2026-10-01T22:15:00Z"

    // 2. Query the aggregated window anchored to that exact timestamp
    const historyQuery = `
      from(bucket: "${bucket}")
        |> range(start: -${range}, stop: time(v: "${latestTime}"))
        |> filter(fn: (r) => r._measurement == "device_metrics")
        |> filter(fn: (r) => r.deviceId == "${deviceId}")
        |> filter(fn: (r) => r.metric == "${metric}")
        |> filter(fn: (r) => r._field == "value")
        |> aggregateWindow(every: ${interval}, fn: mean, createEmpty: false)
        |> keep(columns: ["_time", "_value"])
        |> sort(columns: ["_time"], desc: false)
    `;

    const rows = await this.influxService.query(historyQuery);
    return (
      rows
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        .filter((row) => row._value !== null && row._value !== undefined)
        .map((row) => ({
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
          timestamp: row._time,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          value: Number(row._value),
        }))
    );
  }
  private resolveInterval(range: string): string {
    switch (range) {
      case '15m':
        return '15s';
      case '1h':
        return '1m';
      case '6h':
        return '5m';
      case '24h':
        return '15m';
      case '7d':
        return '2h';
      default:
        return '1m';
    }
  }
}
