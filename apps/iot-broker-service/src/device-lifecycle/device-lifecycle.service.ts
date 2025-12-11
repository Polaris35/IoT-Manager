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
    // Определяем логику по протоколу
    if (
      device.protocol === DeviceProtocol.MQTT ||
      device.protocol === DeviceProtocol.ZIGBEE
    ) {
      // 1. Сценарий MQTT
      if (device.protocol === DeviceProtocol.MQTT) {
        // МАГИЯ ТУТ: Мы явно говорим TS, что это MQTT конфиг
        const config = device.connectionConfig as MqttConnectionConfigDto;

        // Теперь тут работает автокомплит и проверка!
        // TS знает, что config.stateTopic - это string
        if (config.stateTopic) {
          this.mqttService.subscribeToDevice(
            device.id,
            device.profileId,
            config.stateTopic,
          );
        }
      }

      // 2. Сценарий Zigbee
      else if (device.protocol === DeviceProtocol.ZIGBEE) {
        // Тут приводим к Zigbee конфигу
        const config = device.connectionConfig as ZigbeeConnectionConfigDto;

        // Логика формирования топика для Zigbee (как мы обсуждали)
        const prefix = config.topicPrefix || 'zigbee2mqtt';
        // Используем externalId как friendlyName
        const topic = `${prefix}/${device.externalId}`;

        this.mqttService.subscribeToDevice(device.id, device.profileId, topic);
      }
    }

    // Тут можно добавить else if (protocol === TUYA) ...
  }
}
