import {
  Inject,
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientGrpc } from '@nestjs/microservices';
import * as mqtt from 'mqtt';
import { firstValueFrom } from 'rxjs';
import { TelemetryService } from '../../telemetry/telemetry.service';
import { device } from '@iot-manager/proto';

// Interface for subscription context (links topic to specific device and profile)
interface SubscriptionContext {
  deviceId: string;
  profileId: string;
}

@Injectable()
export class MqttService implements OnModuleInit, OnModuleDestroy {
  private profileServiceClient: device.ProfilesServiceClient;
  private client: mqtt.MqttClient;
  private readonly logger = new Logger(MqttService.name);

  // Maps "MQTT Topic" -> "Context (DeviceID, ProfileID)"
  // Used to identify the owner of the incoming message.
  private topicMap = new Map<string, SubscriptionContext>();

  // Local profile cache for fast data mapping (avoids frequent gRPC calls)
  private profileCache = new Map<string, device.ProfileResponse>();

  constructor(
    private config: ConfigService,
    private telemetryService: TelemetryService,
    @Inject('DEVICE_PACKAGE') private clientGrpc: ClientGrpc,
  ) {}
  onModuleInit() {
    this.profileServiceClient =
      this.clientGrpc.getService<device.ProfilesServiceClient>(
        device.PROFILES_SERVICE_NAME,
      );

    const url =
      this.config.get<string>('MQTT_BROKER_URL') || 'mqtt://localhost:1883';
    this.client = mqtt.connect(url);

    this.client.on('connect', () => {
      console.log('✅ [MqttService] Connected to Mosquitto');
      setTimeout(
        () => this.initializeDemoData(), // <-- Initialize hardcoded data for Demo
        10000,
      );
    });
    this.client.on('error', (err) =>
      console.error('❌ [MqttService] Error:', err),
    );
    this.client.on('message', (topic, payload) => {
      void this.handleMessage(topic, payload);
    });
  }

  onModuleDestroy() {
    this.client?.end();
  }

  /**
   * Subscribes to a device topic and saves the context for parsing.
   * Idempotent: safe to call multiple times for the same topic.
   */
  subscribeToDevice(deviceId: string, profileId: string, topic: string) {
    if (!topic) return;

    // Avoid duplicate subscriptions
    if (!this.topicMap.has(topic)) {
      console.log(
        `[MQTT] Subscribing to ${topic} (Device: ${deviceId}, Profile: ${profileId})`,
      );
      this.client.subscribe(topic);
    }
    // Update context (in case the profile changed)
    this.topicMap.set(topic, { deviceId, profileId });
  }

  /**
   * Main message handler.
   * 1. Identifies the device by topic.
   * 2. Retrieves the profile (mapping rules).
   * 3. Extracts metrics and publishes them to TelemetryService.
   */
  private async handleMessage(topic: string, buffer: Buffer) {
    const context = this.topicMap.get(topic);
    if (!context) return; // Ignore topics we are not subscribed to

    const messageStr = buffer.toString();

    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const payload = JSON.parse(messageStr);

      // TODO: In production, fetch profile via gRPC if not in cache: this.getProfileFromGrpc(context.profileId)
      const profile = await this.getProfile(context.profileId);

      if (!profile || !profile.mappings) {
        console.warn(
          `[MQTT] No mappings found for profile ${context.profileId}`,
        );
        return;
      }

      // Iterate through profile mappings and extract metrics
      for (const [metricKey, jsonPath] of Object.entries(profile.mappings)) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const rawValue = this.extractValueByPath(payload, jsonPath);

        if (rawValue !== undefined && rawValue !== null) {
          const numericValue = Number(rawValue);

          if (!isNaN(numericValue)) {
            console.log('New parsed metrics has arrived!: ', {
              deviceId: context.deviceId,
              timestamp: new Date(),
              metricType: metricKey,
              value: numericValue,
            });
            this.telemetryService.publish({
              deviceId: context.deviceId,
              timestamp: new Date(),
              metricType: metricKey,
              value: numericValue,
            });
            //  console.log(`   -> Extracted ${metricKey}: ${numericValue}`);
          }
        }
      }
    } catch (e: any) {
      console.error(
        `[MQTT] Error processing message from ${topic}:`,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        e.message,
      );
    }
  }

  private async getProfile(
    profileId: string,
  ): Promise<device.ProfileResponse | null> {
    if (this.profileCache.has(profileId)) {
      return this.profileCache.get(profileId) as device.ProfileResponse;
    }

    try {
      const profileObservable = this.profileServiceClient.findOne({
        id: profileId,
      });
      const profile: device.ProfileResponse =
        await firstValueFrom(profileObservable);

      if (profile) {
        this.profileCache.set(profileId, profile);
        return profile;
      }
    } catch (e) {
      console.error(`[MQTT] Failed to fetch profile ${profileId}`, e);
    }
    return null;
  }

  /**
   * Initializes hardcoded data for the diploma demo.
   * TODO: Replace with Cold Start synchronization via gRPC (DeviceService.ListDevices).
   */
  private initializeDemoData() {
    this.logger.warn(
      '🧪 [DEMO MODE] Initializing hardcoded profiles and subscriptions...',
    );

    // 1. Profiles
    this.profileCache.set('prof_zigbee_xiaomi_gzcgq01lm', {
      id: 'prof_zigbee_xiaomi_gzcgq01lm',
      mappings: {
        temperature: 'temperature',
        humidity: 'humidity',
        battery: 'battery',
      },
      name: '',
      vendor: '',
      protocol: '',
      description: '',
    });

    this.profileCache.set('prof_wifi_sonoff_pow_r2', {
      id: 'prof_wifi_sonoff_pow_r2',
      mappings: {
        status: 'POWER',
        voltage: 'ENERGY.Voltage',
        power: 'ENERGY.Power',
        current: 'ENERGY.Current',
      },
      name: '',
      vendor: '',
      protocol: '',
      description: '',
    });

    this.profileCache.set('profile_diy_weather', {
      id: 'profile_diy_weather',
      mappings: { temperature: 'temp', status: 'status' },
      name: '',
      vendor: '',
      protocol: '',
      description: '',
    });

    // 2. Subscriptions
    this.subscribeToDevice(
      'device-id-xiaomi-001',
      'prof_zigbee_xiaomi_gzcgq01lm',
      'zigbee2mqtt/sensor_kitchen',
    );
    this.subscribeToDevice(
      'device-id-sonoff-002',
      'prof_wifi_sonoff_pow_r2',
      'tele/sonoff_living_room/SENSOR',
    );
    this.subscribeToDevice(
      'device-id-esp32-003',
      'profile_diy_weather',
      'devices/esp32_garage/state',
    );
  }

  /**
   * Safely extracts a value from a nested object using a dot-notation path.
   * Example: "ENERGY.Voltage" -> obj['ENERGY']['Voltage']
   */
  private extractValueByPath(obj: Record<string, any>, path: string): any {
    return path.split('.').reduce((acc: any, part: string) => {
      // Type Guard: check if acc is an object and has the key
      if (acc && typeof acc === 'object' && part in acc) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return
        return acc[part];
      }
      return undefined;
    }, obj);
  }
}
