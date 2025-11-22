import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { struct } from 'pb-util';
import { ProfilesService } from './profiles.service';
import { GrpcNotFoundException } from 'nestjs-grpc-exceptions';
import { device } from '@iot-manager/proto';

@Controller('profiles')
export class ProfilesController implements device.ProfilesServiceController {
  constructor(private readonly profilesService: ProfilesService) {}

  // Имя метода должно совпадать с .proto (Search)
  // Или можно указать явно: @GrpcMethod('ProfilesService', 'Search')
  @GrpcMethod(device.PROFILES_SERVICE_NAME)
  async search(data: { query: string; protocol: string; limit: number }) {
    const results = await this.profilesService.search(
      data.query,
      data.protocol,
      data.limit,
    );

    // 2. Мапим ответ в формат gRPC
    const mappedProfiles = results.map((p) => ({
      id: p.id,
      name: p.name,
      vendor: p.vendor,
      protocol: p.protocol,
      description: p.description || '',
      // Конвертируем JSONB маппинг в gRPC Struct, если нужно передавать
      // Но для поиска это поле часто можно не отправлять (будет null)
      mappings: p.mappings ? struct.encode(p.mappings) : undefined,
    }));

    return { profiles: mappedProfiles };
  }

  @GrpcMethod(device.PROFILES_SERVICE_NAME)
  async findOne(data: { id: string }) {
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
      mappings: p.mappings ? struct.encode(p.mappings) : undefined,
    };
  }
}
