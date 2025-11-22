import { Controller } from '@nestjs/common';
// import { device } from '@iot-manager/proto';
import { DevicesService } from './devices.service';

@Controller('devices')
// implements device.DeviceManagementServiceController
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}
  // createDevice(request: device.CreateDeviceRequest): Promise<device.Device> {}
  /** Получает устройство по ID */
  //   getDevice(request: device.GetDeviceRequest) {}
  /** Получает список устройств с фильтрацией и пагинацией */
  //   findDevices(
  //     request: device.FindDevicesRequest,
  //   ): Promise<device.FindDevicesResponse> {}
  /** Обновляет данные устройства (частичное обновление) */
  //   updateDevice(request: device.UpdateDeviceRequest): Promise<device.Device> {}
  /** Удаляет устройство */
  //   deleteDevice(request: device.DeleteDeviceRequest): void {}
}
