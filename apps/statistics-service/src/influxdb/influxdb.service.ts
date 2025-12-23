import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  InfluxDB,
  Point,
  WriteApi,
  QueryApi,
} from '@influxdata/influxdb-client';

@Injectable()
export class InfluxDbService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(InfluxDbService.name);
  private client: InfluxDB;
  private writeApi: WriteApi;
  private queryApi: QueryApi;

  constructor(private readonly config: ConfigService) {}

  /**
   * Initializes the InfluxDB client when the module starts.
   * Reads configuration from environment variables.
   */
  onModuleInit() {
    const url = this.config.get<string>('INFLUXDB_URL');
    const token = this.config.get<string>('INFLUXDB_ADMIN_TOKEN');
    const org = this.config.get<string>('INFLUXDB_ORG');
    const bucket = this.config.get<string>('INFLUXDB_BUCKET');

    if (!url || !token || !org || !bucket) {
      throw new Error('Missing InfluxDB configuration in .env');
    }

    this.logger.log(
      `Connecting to InfluxDB at ${url} (Org: ${org}, Bucket: ${bucket})`,
    );

    // Initialize the main client
    this.client = new InfluxDB({ url, token });

    // Initialize Query API (for reading data, e.g., generating graphs)
    this.queryApi = this.client.getQueryApi(org);

    // Initialize Write API (for ingestion)
    // 'ns' stands for nanosecond precision.
    // The client automatically handles batching (buffering points and sending them in groups).
    this.writeApi = this.client.getWriteApi(org, bucket, 'ns', {
      batchSize: 1, // 👈 Писать каждую точку сразу (для тестов)
      flushInterval: 1000, // 👈 Или хотя бы раз в секунду
      // gzip: false, // Отключаем сжатие для локальной разработки (проще дебажить)
    });
  }

  /**
   * Gracefully closes the Write API when the application shuts down.
   * Crucial for flushing any remaining data points in the buffer to the DB.
   */
  async onModuleDestroy() {
    try {
      await this.writeApi.close();
      this.logger.log('InfluxDB WriteApi closed successfully. Buffer flushed.');
    } catch (e) {
      this.logger.error('Error closing InfluxDB WriteApi', e);
    }
  }

  /**
   * Schedules a single data point for writing.
   * NOTE: Data is not sent immediately; it is buffered for performance.
   * @param point The InfluxDB Point object
   */
  writePoint(point: Point) {
    this.writeApi.writePoint(point);
  }

  /**
   * Executes a Flux query against the database.
   * @param fluxQuery The query string in Flux language
   * @returns Array of rows
   */
  async query(fluxQuery: string): Promise<any[]> {
    return this.queryApi.collectRows(fluxQuery);
  }
}
