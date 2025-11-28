import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { DeviceEntity, DeviceProfileEntity } from '@entities';
import { InjectRepository } from '@nestjs/typeorm';
import {
  GrpcAlreadyExistsException,
  GrpcNotFoundException,
} from 'nestjs-grpc-exceptions';

@Injectable()
export class DevicesService {
  constructor(
    @InjectRepository(DeviceEntity)
    private deviceRepository: Repository<DeviceEntity>,
    @InjectRepository(DeviceProfileEntity)
    private profileRepository: Repository<DeviceProfileEntity>,
  ) {}

  // --- CREATE ---
  async create(data: {
    userId: string;
    name: string;
    externalId: string;
    protocol: string;
    profileId: string;
    groupId?: string;
    credentials?: Record<string, any>;
  }) {
    const profile = await this.profileRepository.findOne({
      where: { id: data.profileId },
    });
    if (!profile) {
      throw new GrpcNotFoundException('Device profile not found');
    }

    const existing = await this.deviceRepository.findOne({
      where: { externalId: data.externalId },
    });
    if (existing) {
      throw new GrpcAlreadyExistsException('Device with this ID already exist');
    }

    const device = this.deviceRepository.create({
      userId: data.userId,
      name: data.name,
      externalId: data.externalId,
      protocol: data.protocol,
      profile: profile,
      groupId: data.groupId || undefined,
      credentials: data.credentials || {},
    });

    return this.deviceRepository.save(device);
  }

  // --- GET ONE ---
  async findOne(id: string, userId: string) {
    const device = await this.deviceRepository.findOne({
      where: { id, userId },
      relations: ['profile', 'group'],
    });

    if (!device) {
      throw new GrpcNotFoundException('Device not found');
    }

    return device;
  }

  async findAll(params: {
    userId: string;
    page: number;
    pageSize: number;
    groupId?: string;
  }) {
    const { userId, page, pageSize, groupId } = params;
    const skip = (page - 1) * pageSize;

    const queryBuilder = this.deviceRepository
      .createQueryBuilder('device')
      .leftJoinAndSelect('device.profile', 'profile')
      .leftJoinAndSelect('device.group', 'group')
      .where('device.userId = :userId', { userId });

    if (groupId) {
      queryBuilder.andWhere('device.groupId = :groupId', { groupId });
    }

    const [items, total] = await queryBuilder
      .skip(skip)
      .take(pageSize)
      .getManyAndCount();

    return { items, total };
  }

  async update(id: string, userId: string, updates: Partial<DeviceEntity>) {
    const device = await this.findOne(id, userId);

    const updatedDevice = this.deviceRepository.merge(device, updates);
    return this.deviceRepository.save(updatedDevice);
  }

  async delete(id: string, userId: string) {
    const result = await this.deviceRepository.delete({ id, userId });
    if (result.affected === 0) {
      throw new GrpcNotFoundException('Device not found');
    }
  }
}
