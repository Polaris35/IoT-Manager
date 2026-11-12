import { DeviceProfileEntity } from '@entities';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';

@Injectable()
export class ProfilesService {
  constructor(
    @InjectRepository(DeviceProfileEntity)
    private profileRepository: Repository<DeviceProfileEntity>,
  ) {}

  /**
   * Searches for device profiles based on a query string and optional protocol filter.
   * Useful for autocomplete dropdowns in the UI.
   *
   * @param query - The search string (e.g., "sonoff"), case-insensitive
   * @param protocol - Optional protocol filter (e.g., "WIFI")
   * @param limit - The maximum number of results to return (default: 20)
   * @returns A list of matching device profiles
   */
  async search(query: string, protocol?: string, limit = 20) {
    const whereCondition: any = {};
    if (query) {
      whereCondition.name = ILike(`%${query}%`);
    }

    if (protocol) {
      whereCondition.protocol = protocol;
    }

    return this.profileRepository.find({
      select: {
        id: true,
        name: true,
        vendor: true,
        protocol: true,
        description: true,
      },
      where: whereCondition,
      take: limit,
      order: { name: 'ASC' },
    });
  }

  /**
   * Retrieves a single device profile by its ID.
   *
   * @param id - The ID of the profile
   * @returns The found profile or null
   */
  async findOne(id: string) {
    return this.profileRepository.findOne({ where: { id } });
  }
}
