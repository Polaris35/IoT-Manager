import { Public } from '@iot-manager/nest-libs';
import {
  Controller,
  Get,
  Param,
  Inject,
  Query,
  Post,
  Body,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiTags, ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import { GetDeviceStatsDto } from './dto';
import { StatsResponseDto } from './dto/stats-response.dto';

@ApiTags('Statistics')
@Controller('stats')
export class StatsController {
  constructor(
    @Inject('STATISTICS_SERVICE') private readonly statsClient: ClientProxy,
  ) {}

  @Public()
  @Post('device')
  @ApiOperation({
    summary: 'Fetch device metrics for charts',
    operationId: 'fetchDeviceStats',
  })
  @ApiOkResponse({ type: StatsResponseDto, isArray: true })
  async getAnchoredDeviceStats(@Body() dto: GetDeviceStatsDto) {
    return this.statsClient.send('get_latest_anchored_metrics', dto);
  }
}
