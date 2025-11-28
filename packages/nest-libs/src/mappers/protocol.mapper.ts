import { device } from "@iot-manager/proto";
import { DeviceProtocol } from "./../types/enums/device.enums";
// Функция для преобразования из нашего строкового enum в gRPC-числовой
export function mapEntityProtocolToProto(
  protocol: DeviceProtocol
): device.DeviceProtocol {
  switch (protocol) {
    case DeviceProtocol.MQTT:
      return device.DeviceProtocol.MQTT;
    case DeviceProtocol.ZIGBEE:
      return device.DeviceProtocol.ZIGBEE;
    case DeviceProtocol.TUYA:
      return device.DeviceProtocol.TUYA;
    default:
      throw new Error(`Unknown device protocol: ${protocol}`);
  }
}

// Функция для обратного преобразования: из gRPC-числового в строковый
export function mapProtoProtocolToEntity(
  protocol: device.DeviceProtocol
): DeviceProtocol {
  switch (protocol) {
    case device.DeviceProtocol.MQTT:
      return DeviceProtocol.MQTT;
    case device.DeviceProtocol.ZIGBEE:
      return DeviceProtocol.ZIGBEE;
    case device.DeviceProtocol.TUYA:
      return DeviceProtocol.TUYA;
    default:
      throw new Error(`Unsupported proto device protocol: ${protocol}`);
  }
}
