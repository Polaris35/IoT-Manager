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
  /**
   * Creates a new device for a specific user.
   * Verifies if the device profile exists and ensures the external ID is unique.
   *
   * @param data - The data required to create a device
   * @returns The created device entity
   * @throws GrpcNotFoundException if the profile does not exist
   * @throws GrpcAlreadyExistsException if a device with the same external ID already exists
   */
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
      throw new GrpcAlreadyExistsException(
        'Device with this external ID already exists',
      );
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
  /**
   * Finds a single device by its ID and ensures it belongs to the requesting user.
   *
   * @param id - The internal ID of the device
   * @param userId - The ID of the user requesting the device
   * @returns The device entity with relations
   * @throws GrpcNotFoundException if the device is not found
   */
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

  /**
   * Retrieves a paginated list of devices for a specific user, optionally filtered by group.
   *
   * @param params - Pagination and filtering parameters
   * @returns An object containing the list of items and the total count
   */
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

  /**
   * Updates an existing device.
   *
   * @param id - The ID of the device to update
   * @param userId - The ID of the owner
   * @param updates - Partial device data to update
   * @returns The updated device entity
   */
  async update(id: string, userId: string, updates: Partial<DeviceEntity>) {
    const device = await this.findOne(id, userId);

    const updatedDevice = this.deviceRepository.merge(device, updates);
    return this.deviceRepository.save(updatedDevice);
  }

  /**
   * Deletes a device by ID.
   *
   * @param id - The ID of the device to delete
   * @param userId - The ID of the owner
   * @throws GrpcNotFoundException if the device could not be found or deleted
   */
  async delete(id: string, userId: string) {
    const result = await this.deviceRepository.delete({ id, userId });
    if (result.affected === 0) {
      throw new GrpcNotFoundException('Device not found');
    }
  }
}
