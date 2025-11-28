import { device } from '@iot-manager/proto';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import {
  CreateGroupDto,
  DeviceGroupResponseDto,
  UpdateGroupDto,
} from './dto/group.dto';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class GroupsService implements OnModuleInit {
  private deviceServiceClient: device.DeviceManagementServiceClient;

  constructor(@Inject('DEVICE_PACKAGE') private client: ClientGrpc) {}

  onModuleInit() {
    this.deviceServiceClient =
      this.client.getService<device.DeviceManagementServiceClient>(
        device.DEVICE_MANAGEMENT_SERVICE_NAME,
      );
  }

  // --- CRUD METHODS ---

  async create(
    userId: string,
    dto: CreateGroupDto,
  ): Promise<DeviceGroupResponseDto> {
    const group = await firstValueFrom(
      this.deviceServiceClient.createGroup({
        userId,
        name: dto.name,
        description: dto.description,
      }),
    );
    return this.mapProtoToResponse(group);
  }

  async findAll(userId: string): Promise<DeviceGroupResponseDto[]> {
    const result = await firstValueFrom(
      this.deviceServiceClient.findGroups({
        userId,
        page: 1,
        limit: 100, // TODO: Add pagination support in DTO
      }),
    );

    return result.groups.map((g) => this.mapProtoToResponse(g));
  }

  async findOne(id: string, userId: string): Promise<DeviceGroupResponseDto> {
    const group = await firstValueFrom(
      this.deviceServiceClient.getGroup({ id, userId }),
    );
    return this.mapProtoToResponse(group);
  }

  async update(
    id: string,
    userId: string,
    dto: UpdateGroupDto,
  ): Promise<DeviceGroupResponseDto> {
    const group = await firstValueFrom(
      this.deviceServiceClient.updateGroup({
        id,
        userId,
        name: dto.name,
        description: dto.description,
      }),
    );
    return this.mapProtoToResponse(group);
  }

  async remove(id: string, userId: string): Promise<boolean> {
    await firstValueFrom(this.deviceServiceClient.deleteGroup({ id, userId }));
    return true;
  }

  // --- PRIVATE MAPPER ---

  private mapProtoToResponse(proto: device.Group): DeviceGroupResponseDto {
    return {
      id: proto.id,
      name: proto.name,
      description: proto.description || undefined,
      devicesCount: proto.devicesCount || 0,

      // Convert Google Timestamp -> JavaScript Date
      createdAt: proto.createdAt
        ? new Date(Number(proto.createdAt.seconds) * 1000)
        : new Date(),
    };
  }
}
