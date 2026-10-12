import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ProfilesService } from './profiles.service';
import { ProfileResponseDto, SearchProfileDto } from './dto';
import { Public } from '@iot-manager/nest-libs';
import { plainToInstance } from 'class-transformer';

@Controller('profiles')
@ApiTags('Profiles')
@Public()
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @Get()
  @ApiResponse({
    type: [ProfileResponseDto],
  })
  @ApiOperation({ summary: 'Search profiles', operationId: 'searchProfiles' })
  searchProfiles(@Query() query: SearchProfileDto) {
    return this.profilesService.search(query);
  }

  @ApiResponse({
    type: ProfileResponseDto,
  })
  @Get('/:id')
  @ApiOperation({ summary: 'Get the profile by id', operationId: 'getProfile' })
  async getProfile(
    @Param('id') profileId: string,
  ): Promise<ProfileResponseDto> {
    const profile = await this.profilesService.getProfile(profileId);
    return plainToInstance(ProfileResponseDto, profile, {
      excludeExtraneousValues: true,
    });
  }
}
