import { GroupEntity } from '@entities';
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

  /**
   * Creates a new device group.
   * Initializes with 0 devices.
   *
   * @param userId Owner's ID
   * @param name Group name
   * @param description Optional description
   */
  async create(
    userId: string,
    name: string,
    description?: string,
  ): Promise<GroupWithCount> {
    const group = this.groupRepository.create({
      userId,
      name,
      description,
    });

    const savedGroup = await this.groupRepository.save(group);

    // Return consistent structure with devicesCount
    return {
      ...savedGroup,
      devicesCount: 0,
    };
  }

  /**
   * Retrieves a single group by ID and User ID.
   * Includes the count of associated devices.
   *
   * @param id Group UUID
   * @param userId Owner UUID
   * @throws RpcException if group is not found
   */
  async findOne(id: string, userId: string): Promise<GroupWithCount> {
    // Optimized: Use QueryBuilder to count devices without fetching them
    const group = await this.groupRepository
      .createQueryBuilder('group')
      .where('group.id = :id', { id })
      .andWhere('group.userId = :userId', { userId })
      .loadRelationCountAndMap('group.devicesCount', 'group.devices')
      .getOne();

    if (!group) {
      throw new GrpcNotFoundException('Group not found');
    }

    // Cast is safe here because loadRelationCountAndMap populates the property
    return group as GroupWithCount;
  }

  /**
   * Retrieves a paginated list of groups for a specific user.
   * Results are ordered by creation date (newest first).
   *
   * @param userId Owner UUID
   * @param page Page number (1-based)
   * @param limit Number of items per page
   */
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
      .orderBy('group.createdAt', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      groups: groups as GroupWithCount[],
      total,
    };
  }

  /**
   * Updates an existing group.
   * Performs a partial update and returns the updated entity.
   *
   * @param id Group UUID
   * @param userId Owner UUID
   * @param updates Partial group object
   */
  async update(
    id: string,
    userId: string,
    updates: Partial<GroupEntity>,
  ): Promise<GroupWithCount> {
    // Ensure the group exists and belongs to the user
    const group = await this.findOne(id, userId);

    // Merge updates into the existing entity
    this.groupRepository.merge(group, updates);
    const saved = await this.groupRepository.save(group);

    return {
      ...saved,
      // Persist the count we fetched in findOne
      devicesCount: group.devicesCount,
    };
  }

  /**
   * Deletes a group by ID.
   *
   * @param id Group UUID
   * @param userId Owner UUID
   * @returns true if deletion was successful
   * @throws RpcException if group is not found
   */
  async delete(id: string, userId: string): Promise<boolean> {
    const result = await this.groupRepository.delete({ id, userId });

    if (result.affected === 0) {
      throw new GrpcNotFoundException('Group not found');
    }

    return true;
  }
}
