// apps/iot-broker-service/src/telemetry/telemetry.service.ts
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

export interface TelemetryData {
  deviceId: string;
  metricType: string;
  value: number;
  timestamp: Date;
}

@Injectable()
export class TelemetryService {
  constructor(@Inject('TELEMETRY_RMQ_CLIENT') private client: ClientProxy) {}

  publish(data: TelemetryData) {
    // Отправляем событие "telemetry.created"
    // .emit() означает, что мы не ждем ответа (Fire and Forget)
    this.client.emit('telemetry.created', data);
    console.log(
      `[Telemetry] Sent ${data.metricType}:${data.value} for ${data.deviceId}`,
    );
  }
}
