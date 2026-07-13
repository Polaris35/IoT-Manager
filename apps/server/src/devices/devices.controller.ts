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
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { FindDevicesDto } from './dto/devices/find-device.dto';
import { DevicesListDto } from './dto/devices/devices-list.dto';
import { DeviceResponseDto } from './dto/devices/device-response.dto';
import { plainToInstance } from 'class-transformer';

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
  @ApiOkResponse({ type: DeviceResponseDto })
  @Post()
  async createDevice(
    @Body() dto: CreateDeviceDto,
    @CurrentUser('id') id: string,
  ) {
    const device = await this.devicesService.createDevice(dto, id);
    return plainToInstance(DeviceResponseDto, device, {
      excludeExtraneousValues: true,
    });
  }

  @ApiResponse({
    status: 200,
    description: 'The device has been successfully updated.',
  })
  @ApiOperation({
    summary: 'Update a device record',
    operationId: 'updateDevice',
  })
  @ApiOkResponse({ type: DeviceResponseDto })
  @Put()
  async updateDevice(
    @Body() dto: UpdateDeviceDto,
    @CurrentUser('id') id: string,
  ) {
    const device = await this.devicesService.updateDevice(dto, id);
    return plainToInstance(DeviceResponseDto, device, {
      excludeExtraneousValues: true,
    });
  }

  @Get('/:id')
  @ApiOperation({
    summary: 'Request device by id',
    operationId: 'getDevice',
  })
  @ApiOkResponse({ type: DeviceResponseDto })
  async getDevice(
    @Param('id') deviceId: string,
    @CurrentUser('id') userId: string,
  ) {
    const device = await this.devicesService.getDevice(deviceId, userId);
    return plainToInstance(DeviceResponseDto, device, {
      excludeExtraneousValues: true,
    });
  }

  @Get()
  @ApiOperation({
    summary: 'get all devices of authorized user',
    operationId: 'getUserDevices',
  })
  @ApiOkResponse({ type: DevicesListDto })
  async getUserDevices(
    @Query() query: FindDevicesDto,
    @CurrentUser('id') userId: string,
  ) {
    const devices = await this.devicesService.getUserDevices(query, userId);
    return plainToInstance(DevicesListDto, devices, {
      excludeExtraneousValues: true,
    });
  }
}
