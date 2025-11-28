import { Controller } from '@nestjs/common';
import { GroupsService } from './groups.service';
import { device } from '@iot-manager/proto';
import { GrpcMethod } from '@nestjs/microservices';
import { GroupWithCount } from './types';

@Controller()
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @GrpcMethod(device.DEVICE_MANAGEMENT_SERVICE_NAME)
  async createGroup(request: device.CreateGroupRequest): Promise<device.Group> {
    const group = await this.groupsService.create(
      request.userId,
      request.name,
      request.description,
    );
    return this.mapGroupToProto({ ...group, devicesCount: 0 });
  }

  @GrpcMethod(device.DEVICE_MANAGEMENT_SERVICE_NAME)
  async getGroup(request: device.GetGroupRequest) {
    const group = await this.groupsService.findOne(request.id, request.userId);
    return this.mapGroupToProto(group);
  }

  @GrpcMethod(device.DEVICE_MANAGEMENT_SERVICE_NAME)
  async findGroups(request: device.FindGroupsRequest) {
    const { groups, total } = await this.groupsService.findAll(
      request.userId,
      request.page || 1,
      request.limit || 100,
    );

    return {
      groups: groups.map((g) => this.mapGroupToProto(g)),
      total,
    };
  }

  @GrpcMethod(device.DEVICE_MANAGEMENT_SERVICE_NAME)
  async updateGroup(request: device.UpdateGroupRequest) {
    const updates: any = {};
    if (request.name) updates.name = request.name;
    if (request.description !== undefined)
      updates.description = request.description;

    const group = await this.groupsService.update(
      request.id,
      request.userId,
      updates,
    );
    return this.mapGroupToProto(group);
  }

  @GrpcMethod(device.DEVICE_MANAGEMENT_SERVICE_NAME)
  async deleteGroup(request: device.DeleteGroupRequest) {
    const success = await this.groupsService.delete(request.id, request.userId);
    return { success };
  }

  // --- MAPPER ---
  private mapGroupToProto(entity: GroupWithCount): device.Group {
    return {
      id: entity.id,
      userId: entity.userId,
      name: entity.name,
      description: entity.description,
      devicesCount: entity.devicesCount || 0, // Поле из loadRelationCountAndMap
      createdAt: {
        seconds: Math.floor(entity.createdAt.getTime() / 1000),
        nanos: 0,
      },
    };
  }
}
