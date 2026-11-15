import {
  Inject,
  Injectable,
  Logger,
  OnApplicationBootstrap,
} from '@nestjs/common';
import { MqttService } from '../protocols/mqtt/mqtt.service';
import {
  DeviceCreatedEventDto,
  DeviceProtocol,
  MqttConnectionConfigDto,
  ZigbeeConnectionConfigDto,
} from '@iot-manager/nest-libs';
import Redis from 'ioredis';
import { REDIS_CLIENT } from '@redis-client/redis-client.module';
import { firstValueFrom } from 'rxjs';
import { device } from '@iot-manager/proto';
import { ClientGrpc } from '@nestjs/microservices';

@Injectable()
export class DeviceLifecycleService implements OnApplicationBootstrap {
  logger = new Logger(DeviceLifecycleService.name);
  private deviceServiceClient: device.DeviceManagementServiceClient;

  constructor(
    private readonly mqttService: MqttService,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
    @Inject('DEVICE_PACKAGE') private clientGrpc: ClientGrpc,
  ) {
    this.deviceServiceClient =
      this.clientGrpc.getService<device.DeviceManagementServiceClient>(
        device.DEVICE_MANAGEMENT_SERVICE_NAME,
      );
  }
  onApplicationBootstrap() {
    this.logger.log('🔄 [Cold Start] Initiating device synchronization...');

    setTimeout(() => void this.syncDevicesFromDatabase(), 3000);
  }

  registerNewDevice(device: DeviceCreatedEventDto) {
    if (
      device.protocol === DeviceProtocol.MQTT ||
      device.protocol === DeviceProtocol.ZIGBEE
    ) {
      if (device.protocol === DeviceProtocol.MQTT) {
        const config = device.connectionConfig as MqttConnectionConfigDto;

        if (config.stateTopic) {
          this.mqttService.registerDevice(
            device.id,
            device.userId,
            device.profileId,
            config.stateTopic,
          );
        }
      } else if (device.protocol === DeviceProtocol.ZIGBEE) {
        const config = device.connectionConfig as ZigbeeConnectionConfigDto;
        const prefix = config.topicPrefix || 'zigbee2mqtt';
        const topic = `${prefix}/${device.externalId}`;

        this.mqttService.registerDevice(
          device.id,
          device.userId,
          device.profileId,
          topic,
        );
      }
    }
  }

  async getCurrentMetrics(deviceId: string): Promise<Record<string, string>> {
    return this.redis.hgetall(`device:${deviceId}:state`);
  }

  private async syncDevicesFromDatabase() {
    try {
      this.logger.log('📡 Fetching devices from Device Service via gRPC...');

      const devicesObservable = this.deviceServiceClient.getAllDevices({});

      const grpcResult: device.GetAllDevicesResponse =
        await firstValueFrom(devicesObservable);

      if (!grpcResult || !grpcResult.devices) {
        this.logger.warn('⚠️ No devices found in Database.');
        return;
      }

      this.logger.log(
        `📦 Found ${grpcResult?.devices.length} devices. Registering...`,
      );

      for (const grpcDevice of grpcResult.devices) {
        try {
          const deviceDto: DeviceCreatedEventDto = {
            id: grpcDevice.id,
            userId: grpcDevice.userId,
            protocol: grpcDevice.protocol as DeviceProtocol,
            externalId: grpcDevice.externalId,
            profileId: grpcDevice.profileId,

            connectionConfig: JSON.parse(grpcDevice.connectionConfig || '{}'),
          };

          this.registerNewDevice(deviceDto);
        } catch (err) {
          this.logger.error(
            `❌ Failed to register device ${grpcDevice.id} during Cold Start`,
            err,
          );
        }
      }

      this.logger.log('✅ [Cold Start] Synchronization complete.');
    } catch (error) {
      this.logger.error(
        '💥 [Cold Start] gRPC request failed. Is Device Service running?',
        error,
      );
    }
  }
}
