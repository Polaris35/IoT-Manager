import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

export interface TelemetryData {
  deviceId: string;
  metricType: string;
  value: number;
  userId: string;
  timestamp: Date;
}

@Injectable()
export class TelemetryService {
  constructor(
    @Inject('TELEMETRY_RMQ_CLIENT') private dbClient: ClientProxy,
    @Inject('STREAM_RMQ_CLIENT') private streamClient: ClientProxy,
  ) {}

  publish(data: TelemetryData) {
    this.dbClient.emit('telemetry.created', data);
    this.streamClient.emit('stream.metrics', data);
  }
}
