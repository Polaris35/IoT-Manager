import { Injectable } from '@nestjs/common';
import { MqttService } from '../protocols/mqtt/mqtt.service';
import {
  DeviceCreatedEventDto,
  DeviceProtocol,
  MqttConnectionConfigDto,
  ZigbeeConnectionConfigDto,
} from '@iot-manager/nest-libs';

@Injectable()
export class DeviceLifecycleService {
  constructor(private readonly mqttService: MqttService) {}

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
            device.profileId,
            config.stateTopic,
          );
        }
      } else if (device.protocol === DeviceProtocol.ZIGBEE) {
        const config = device.connectionConfig as ZigbeeConnectionConfigDto;
        const prefix = config.topicPrefix || 'zigbee2mqtt';
        const topic = `${prefix}/${device.externalId}`;

        this.mqttService.registerDevice(device.id, device.profileId, topic);
      }
    }
  }
}
