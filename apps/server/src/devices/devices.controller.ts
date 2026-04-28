import {
  Controller,
  UseInterceptors,
  Post,
  Body,
  Put,
  Get,
  Query,
  Param,
} from '@nestjs/common';
import { GrpcToHttpInterceptor } from 'nestjs-grpc-exceptions';
import { CreateDeviceDto, UpdateDeviceDto } from './dto';
import { CurrentUser } from '@iot-manager/nest-libs';
import { DevicesService } from './devices.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { FindDevicesDto } from './dto/devices/find-device.dto';

@Controller('devices')
@ApiTags('devices')
@ApiBearerAuth()
@UseInterceptors(new GrpcToHttpInterceptor())
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  @ApiResponse({
    status: 201,
    description: 'The device has been successfully created.',
  })
  @ApiOperation({
    summary: 'Create a new device',
    operationId: 'createDevice',
  })
  @Post()
  createDevice(@Body() dto: CreateDeviceDto, @CurrentUser('id') id: string) {
    return this.devicesService.createDevice(dto, id);
  }

  @ApiResponse({
    status: 200,
    description: 'The device has been successfully updated.',
  })
  @ApiOperation({
    summary: 'Update a device record',
    operationId: 'updateDevice',
  })
  @Put()
  updateDevice(@Body() dto: UpdateDeviceDto, @CurrentUser('id') id: string) {
    return this.devicesService.updateDevice(dto, id);
  }

  @Get('/:id')
  @ApiOperation({
    summary: 'Request device by id',
    operationId: 'getDevice',
  })
  getDevice(@Param('id') deviceId: string, @CurrentUser('id') userId: string) {
    return this.devicesService.getDevice(deviceId, userId);
  }

  @Get()
  @ApiOperation({
    summary: 'get all devices of authorithed user',
    operationId: 'getUserDevices',
  })
  getUserDevices(
    @Query() query: FindDevicesDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.devicesService.getUserDevices(query, userId);
  }
}
