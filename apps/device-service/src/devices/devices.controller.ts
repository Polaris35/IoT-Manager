import { Controller } from '@nestjs/common';
import { device } from '@iot-manager/proto';
import { DevicesService } from './devices.service';
import { GrpcMethod } from '@nestjs/microservices';
import { DeviceEntity } from '@entities';
import {
  mapEntityProtocolToProto,
  mapProtoProtocolToEntity,
} from '@iot-manager/nest-libs/mappers';
import { DeviceProtocol } from '@iot-manager/nest-libs/enums';

@Controller('devices')
export class DevicesController
  implements device.DeviceManagementServiceController
{
  constructor(private readonly devicesService: DevicesService) {}
  @GrpcMethod(device.DEVICE_MANAGEMENT_SERVICE_NAME)
  async createDevice(
    request: device.CreateDeviceRequest,
  ): Promise<device.Device> {
    const deviceEntity = await this.devicesService.create({
      userId: request.userId,
      name: request.name,
      externalId: request.externalId,
      protocol: mapProtoProtocolToEntity(request.protocol),
      profileId: request.profileId,
      groupId: request.groupId,
      credentials: request.connectionConfig,
    });
    return this.mapEntityToProto(deviceEntity);
  }
  @GrpcMethod(device.DEVICE_MANAGEMENT_SERVICE_NAME)
  async getDevice(request: device.GetDeviceRequest): Promise<device.Device> {
    const deviceEntity = await this.devicesService.findOne(
      request.id,
      request.userId,
    );
    return this.mapEntityToProto(deviceEntity);
  }
  @GrpcMethod(device.DEVICE_MANAGEMENT_SERVICE_NAME)
  async findDevices(
    request: device.FindDevicesRequest,
  ): Promise<device.FindDevicesResponse> {
    const { items, total } = await this.devicesService.findAll({
      userId: request.userId,
      page: request.page || 1,
      pageSize: request.limit || 10,
      groupId: request.groupId,
    });

    console.log('findDevices total devices: ', total);
    return {
      devices: items.map((item) => this.mapEntityToProto(item)),
      total,
    };
  }
  @GrpcMethod(device.DEVICE_MANAGEMENT_SERVICE_NAME)
  async updateDevice(
    request: device.UpdateDeviceRequest,
  ): Promise<device.Device> {
    const updates: Partial<DeviceEntity> = {};
    if (request.name) updates.name = request.name;
    // Логика для groupId: если пришла пустая строка - сбрасываем, если ID - ставим
    if (request.groupId !== undefined) {
      updates.groupId = request.groupId === '' ? undefined : request.groupId;
    }
    const deviceEntity = await this.devicesService.update(
      request.id,
      request.userId,
      updates,
    );
    return this.mapEntityToProto(deviceEntity);
  }

  @GrpcMethod(device.DEVICE_MANAGEMENT_SERVICE_NAME)
  async deleteDevice(request: device.DeleteDeviceRequest): Promise<void> {
    await this.devicesService.delete(request.id, request.userId);
  }

  // --- PRIVATE MAPPER (Entity -> Proto Device) ---
  private mapEntityToProto(entity: DeviceEntity): device.Device {
    return {
      id: entity.id,
      userId: entity.userId,
      name: entity.name,
      groupId: entity.groupId || undefined,
      protocol: mapEntityProtocolToProto(DeviceProtocol[entity.protocol]),
      connectionConfig: entity.credentials || undefined,
    };
  }
}
