import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { ProfilesService } from './profiles.service';
import { GrpcNotFoundException } from 'nestjs-grpc-exceptions';
import { device } from '@iot-manager/proto';

@Controller('profiles')
export class ProfilesController implements device.ProfilesServiceController {
  constructor(private readonly profilesService: ProfilesService) {}

  @GrpcMethod(device.PROFILES_SERVICE_NAME)
  async search(data: { query: string; protocol: string; limit: number }) {
    const results = await this.profilesService.search(
      data.query,
      data.protocol,
      data.limit,
    );

    // Map the results to the gRPC response format
    const mappedProfiles = results.map((p) => ({
      id: p.id,
      name: p.name,
      vendor: p.vendor,
      protocol: p.protocol,
      description: p.description || '',
      commandMode: '',
      mappings: '',
      commands: '',
    }));

    return { profiles: mappedProfiles };
  }

  @GrpcMethod(device.PROFILES_SERVICE_NAME)
  async findOne(data: { id: string }): Promise<device.ProfileResponse> {
    const p = await this.profilesService.findOne(data.id);
    if (!p) {
      throw new GrpcNotFoundException(`can't find profile with id: ${data.id}`);
    }

    return {
      id: p.id,
      name: p.name,
      vendor: p.vendor,
      protocol: p.protocol,
      description: p.description || '',
      commandMode: p.commandMode,
      mappings: JSON.stringify(p.mappings || {}),
      commands: JSON.stringify(p.commands || {}),
    };
  }
}
