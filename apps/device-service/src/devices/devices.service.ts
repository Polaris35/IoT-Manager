import { Inject, Injectable } from '@nestjs/common';
import { device } from '@iot-manager/proto';
import { Repository } from 'typeorm';
import { DeviceEntity } from '@entities';

@Injectable()
export class DevicesService {
  // constructor(
  //   @Inject(DeviceEntity)
  //   private readonly deviceRepository: Repository<DeviceEntity>,
  // ) {}
  // async createDevice(data: device.CreateDeviceRequest): Promise<device.Device> {
  //   const device = this.deviceRepository.create({
  //     userId: data.userId,
  //     name: data.name,
  //     externalId: data.externalId,
  //     protocol: data.protocol,
  //   });
  //   return device;
  // }
}
