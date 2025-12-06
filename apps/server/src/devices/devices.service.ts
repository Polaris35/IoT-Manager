import { device } from '@iot-manager/proto';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { CreateDeviceDto, UpdateDeviceDto } from './dto';
import { struct } from 'pb-util';
import {
  mapEntityProtocolToProto,
  mapProtoProtocolToEntity,
} from '@iot-manager/nest-libs';
import { FindDevicesDto } from './dto/devices/find-device.dto';

@Injectable()
export class DevicesService implements OnModuleInit {
  private deviceServiceClient: device.DeviceManagementServiceClient;

  onModuleInit() {
    this.deviceServiceClient =
      this.client.getService<device.DeviceManagementServiceClient>(
        device.DEVICE_MANAGEMENT_SERVICE_NAME,
      );
  }

  constructor(@Inject('DEVICE_PACKAGE') private client: ClientGrpc) {}

  async createDevice(dto: CreateDeviceDto, userId: string) {
    const device = await firstValueFrom(
      this.deviceServiceClient.createDevice({
        userId,
        name: dto.name,
        externalId: dto.externalId,
        protocol: mapEntityProtocolToProto(dto.protocol),
        groupId: dto.groupId,
        profileId: dto.profileId,
        connectionConfig: struct.encode({ ...dto.connectionConfig }),
      }),
    );
    return { ...device, protocol: mapProtoProtocolToEntity(device.protocol) };
  }

  async updateDevice(dto: UpdateDeviceDto, userId: string) {
    const updatedDevice = await firstValueFrom(
      this.deviceServiceClient.updateDevice({
        id: dto.id,
        userId: userId,
        name: dto?.name!,
        groupId: dto?.groupId!,
      }),
    );
    return {
      ...updatedDevice,
      protocol: mapProtoProtocolToEntity(updatedDevice.protocol),
    };
  }

  async getDevice(deviceId: string, userId: string) {
    const device = await firstValueFrom(
      this.deviceServiceClient.getDevice({ id: deviceId, userId }),
    );

    return {
      ...device,
      protocol: mapProtoProtocolToEntity(device.protocol),
    };
  }

  async getUserDevices(dto: FindDevicesDto, userId: string) {
    const rezult = await firstValueFrom(
      this.deviceServiceClient.findDevices({
        userId,
        protocol: dto.protocol
          ? mapEntityProtocolToProto(dto.protocol)
          : undefined,
        groupId: dto.groupId,
        limit: dto.limit,
        page: dto.page,
      }),
    );
    console.log(rezult);

    return {
      total: rezult.total,
      devices: rezult.devices.map((device) => {
        return {
          ...device,
          protocol: mapProtoProtocolToEntity(device.protocol),
        };
      }),
    };
  }
}
