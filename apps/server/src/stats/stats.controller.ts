import { Public } from '@iot-manager/nest-libs';
import { Controller, Get, Param, Inject, Query } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Statistics')
@Controller('stats')
export class StatsController {
  constructor(
    // Убедись, что 'STATISTICS_SERVICE' зарегистрирован в Module с Transport.RMQ
    @Inject('STATISTICS_SERVICE') private readonly statsClient: ClientProxy,
  ) {}

  @Public()
  @Get('device/:id')
  @ApiOperation({ summary: 'Get telemetry history for a device' })
  async getDeviceStats(
    @Param('id') id: string,
    @Query('range') range: string = '-1h', // -1h, -24h, -7d
  ) {
    // Используем .send(), так как ждем ответ
    return this.statsClient.send('get_device_stats', { deviceId: id, range });
  }
}
