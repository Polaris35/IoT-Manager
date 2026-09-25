import { device } from '@iot-manager/proto';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc, ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { CreateDeviceDto, UpdateDeviceDto } from './dto';
import { DeviceProtocol } from '@iot-manager/nest-libs';
import { FindDevicesDto } from './dto/devices/find-device.dto';
import pLimit from 'p-limit';

// limit for request device metrics
const deviceMetricsLimit = pLimit(12);

@Injectable()
export class DevicesService implements OnModuleInit {
  private deviceServiceClient: device.DeviceManagementServiceClient;

  onModuleInit() {
    this.deviceServiceClient =
      this.client.getService<device.DeviceManagementServiceClient>(
        device.DEVICE_MANAGEMENT_SERVICE_NAME,
      );
  }

  constructor(
    @Inject('DEVICE_PACKAGE') private client: ClientGrpc,
    @Inject('IOT_BROKER_CLIENT')
    private readonly iotBroker: ClientProxy,
  ) {}

  async createDevice(dto: CreateDeviceDto, userId: string) {
    const device = await firstValueFrom(
      this.deviceServiceClient.createDevice({
        userId,
        name: dto.name,
        externalId: dto.externalId,
        protocol: DeviceProtocol[dto.protocol],
        groupId: dto.groupId,
        profileId: dto.profileId,
        connectionConfig: JSON.stringify(dto.connectionConfig),
      }),
    );
    return { ...device, connectionConfig: JSON.parse(device.connectionConfig) };
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
    return updatedDevice;
  }

  async getDevice(deviceId: string, userId: string) {
    const device = await firstValueFrom(
      this.deviceServiceClient.getDevice({ id: deviceId, userId }),
    );

    return device;
  }

  async getUserDevices(dto: FindDevicesDto, userId: string) {
    const devices = await firstValueFrom(
      this.deviceServiceClient.findDevices({
        userId,
        protocol: dto.protocol,
        groupId: dto.groupId,
        limit: dto.limit,
        page: dto.page,
      }),
    );

    const devicesWithMetrics = await Promise.all(
      devices.devices.map((device) =>
        deviceMetricsLimit(async () => {
          const metrics = await firstValueFrom(
            this.iotBroker.send('device.current-metrics.get', {
              deviceId: device.id,
            }),
          );
          return { metrics: metrics.metrics, ...device };
        }),
      ),
    );

    return {
      total: devices.total,
      devices: devicesWithMetrics,
    };
  }
}
