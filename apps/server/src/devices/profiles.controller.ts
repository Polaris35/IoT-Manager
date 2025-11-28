import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiResponseProperty, ApiTags } from '@nestjs/swagger';
import { ProfilesService } from './profiles.service';
import { ProfileResponseDto, SearchProfileDto } from './dto';
import { Public } from '@iot-manager/nest-libs/decorators';

@Controller('profiles')
@ApiTags('Profiles')
@Public()
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @Get()
  searchProfiles(@Query() query: SearchProfileDto) {
    return this.profilesService.search(query);
  }

  @ApiResponseProperty({
    type: ProfileResponseDto,
  })
  @Get('/:id')
  getProfile(@Param('id') profileId: string): Promise<ProfileResponseDto> {
    return this.profilesService.getProfile(profileId);
  }
}
