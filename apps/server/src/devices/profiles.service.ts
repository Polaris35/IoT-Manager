import { device } from '@iot-manager/proto';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { SearchProfileDto } from './dto';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ProfilesService implements OnModuleInit {
  private profileServiceClient: device.ProfilesServiceClient;

  onModuleInit() {
    this.profileServiceClient =
      this.client.getService<device.ProfilesServiceClient>(
        device.PROFILES_SERVICE_NAME,
      );
  }

  constructor(@Inject('DEVICE_PACKAGE') private client: ClientGrpc) {}

  async search(dto: SearchProfileDto) {
    const profiles = await firstValueFrom(
      this.profileServiceClient.search({
        query: dto.q,
        protocol: dto.protocol?.toString(),
        limit: dto.limit,
      }),
    );
    return profiles;
  }

  getProfile(id: string) {
    return firstValueFrom(this.profileServiceClient.findOne({ id }));
  }
}
