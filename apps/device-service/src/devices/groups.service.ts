import { GroupEntity } from '@entities';
import { device } from '@iot-manager/proto';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { GrpcNotFoundException } from 'nestjs-grpc-exceptions';
import { Repository } from 'typeorm';
import { GroupWithCount } from './types';

@Injectable()
export class GroupsService {
  constructor(
    @InjectRepository(GroupEntity)
    private groupRepository: Repository<GroupEntity>,
  ) {}

  // --- CREATE ---
  async create(userId: string, name: string, description?: string) {
    const group = this.groupRepository.create({
      userId,
      name,
      description,
    });
    return this.groupRepository.save(group);
  }

  // --- FIND ONE ---
  async findOne(id: string, userId: string): Promise<GroupWithCount> {
    const group = await this.groupRepository.findOne({
      where: { id, userId },
      relations: ['devices'],
    });

    if (!group) {
      throw new GrpcNotFoundException('Group not found');
    }

    return {
      ...group,
      devicesCount: group.devices?.length || 0,
    };
  }

  // --- FIND ALL (With Count!) ---
  async findAll(
    userId: string,
    page: number,
    limit: number,
  ): Promise<{ groups: GroupWithCount[]; total: number }> {
    const skip = (page - 1) * limit;

    const [groups, total] = await this.groupRepository
      .createQueryBuilder('group')
      .where('group.userId = :userId', { userId })
      .loadRelationCountAndMap('group.devicesCount', 'group.devices')
      .skip(skip)
      .take(limit)
      .orderBy('group.createdAt', 'DESC')
      .getManyAndCount();

    return {
      groups: groups as GroupWithCount[],
      total,
    };
  }

  // --- UPDATE ---
  async update(
    id: string,
    userId: string,
    updates: Partial<GroupEntity>,
  ): Promise<GroupWithCount> {
    // findOne уже должен возвращать GroupWithCount (см. реализацию ниже)
    const group = await this.findOne(id, userId);

    this.groupRepository.merge(group, updates);
    const saved = await this.groupRepository.save(group);

    return {
      ...saved,
      devicesCount: group.devicesCount || 0, // Сохраняем счетчик, который был при загрузке
    };
  }

  // --- DELETE ---
  async delete(id: string, userId: string) {
    const result = await this.groupRepository.delete({ id, userId });
    if (result.affected === 0) {
      throw new GrpcNotFoundException('Group not found');
    }
    return true;
  }
}
