import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { ProfilesService } from './profiles.service';
import { ProfileResponseDto, SearchProfileDto } from './dto';
import { Public } from '@iot-manager/nest-libs';

@Controller('profiles')
@ApiTags('Profiles')
@Public()
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @Get()
  @ApiResponse({
    type: [ProfileResponseDto],
  })
  searchProfiles(@Query() query: SearchProfileDto) {
    return this.profilesService.search(query);
  }

  @ApiResponse({
    type: ProfileResponseDto,
  })
  @Get('/:id')
  getProfile(@Param('id') profileId: string): Promise<ProfileResponseDto> {
    return this.profilesService.getProfile(profileId);
  }
}
