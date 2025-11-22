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
   * Searching profiles for drop list (Autocomplete)
   * @param query - Search field ("sonoff")
   * @param protocol - Filter ("WIFI")
   */
  async search(query: string, protocol?: string, limit = 20) {
    const whereCondition: any = {};
    // 1. Filter by name (ILIKE = нечувствительно к регистру)
    // Find and "Sonoff", and "sonoff", and "SONOFF"
    if (query) {
      whereCondition.name = ILike(`%${query}%`);
    }
    // 2. Filter by protocol (for UI radio-button)
    if (protocol) {
      whereCondition.protocol = protocol;
    }

    return this.profileRepository.find({
      where: whereCondition,
      take: limit, // Ограничиваем выдачу, чтобы не грузить сеть
      order: { name: 'ASC' }, // Sort  А-Z
      // select: ['id', 'name', 'vendor', 'image'] // Optimization: take on needed for UI
    });
  }

  async findOne(id: string) {
    return this.profileRepository.findOne({ where: { id } });
  }
}
