import { Inject, Injectable } from '@nestjs/common';
import { MqttService } from '../protocols/mqtt/mqtt.service';
import {
  DeviceCreatedEventDto,
  DeviceProtocol,
  MqttConnectionConfigDto,
  ZigbeeConnectionConfigDto,
} from '@iot-manager/nest-libs';
import Redis from 'ioredis';
import { REDIS_CLIENT } from '@redis-client/redis-client.module';

@Injectable()
export class DeviceLifecycleService {
  constructor(
    private readonly mqttService: MqttService,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
  ) {}

  registerNewDevice(device: DeviceCreatedEventDto) {
    if (
      device.protocol === DeviceProtocol.MQTT ||
      device.protocol === DeviceProtocol.ZIGBEE
    ) {
      if (device.protocol === DeviceProtocol.MQTT) {
        const config = device.connectionConfig as MqttConnectionConfigDto;

        if (config.stateTopic) {
          this.mqttService.registerDevice(
            device.id,
            device.userId,
            device.profileId,
            config.stateTopic,
          );
        }
      } else if (device.protocol === DeviceProtocol.ZIGBEE) {
        const config = device.connectionConfig as ZigbeeConnectionConfigDto;
        const prefix = config.topicPrefix || 'zigbee2mqtt';
        const topic = `${prefix}/${device.externalId}`;

        this.mqttService.registerDevice(
          device.id,
          device.userId,
          device.profileId,
          topic,
        );
      }
    }
  }
  async getCurrentMetrics(deviceId: string): Promise<Record<string, string>> {
    return this.redis.hgetall(`device:${deviceId}:state`);
  }
}
