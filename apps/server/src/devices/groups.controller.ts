import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { GroupsService } from './groups.service';
import {
  CreateGroupDto,
  DeviceGroupResponseDto,
  UpdateGroupDto,
} from './dto/group.dto';
import { CurrentUser } from '@iot-manager/nest-libs';

@ApiTags('Groups (Rooms)')
@ApiBearerAuth()
@Controller('groups')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new device group' })
  @ApiResponse({ status: 201, type: DeviceGroupResponseDto })
  create(@Body() dto: CreateGroupDto, @CurrentUser('id') userId: string) {
    return this.groupsService.create(userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get list of user groups' })
  @ApiResponse({ status: 200, type: [DeviceGroupResponseDto] })
  findAll(@CurrentUser('id') userId: string) {
    return this.groupsService.findAll(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get group details' })
  @ApiResponse({ status: 200, type: DeviceGroupResponseDto })
  findOne(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.groupsService.findOne(id, userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update group details' })
  @ApiResponse({ status: 200, type: DeviceGroupResponseDto })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateGroupDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.groupsService.update(id, userId, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete group' })
  @ApiResponse({ status: 200, description: 'Group deleted successfully' })
  async remove(@Param('id') id: string, @CurrentUser('id') userId: string) {
    await this.groupsService.remove(id, userId);
    return { success: true };
  }
}
