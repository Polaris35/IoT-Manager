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
import Redis from 'ioredis';
import { REDIS_CLIENT } from '@redis-client/redis-client.module';
import { isRecord } from 'src/utils';

// Interface for subscription context (links topic to specific device and profile)
interface SubscriptionContext {
  deviceId: string;
  profileId: string;
}

@Injectable()
export class MqttService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(MqttService.name);
  /**
   * Profiles service gRPC cient
   * used to obtain devices profile
   */
  private profileServiceClient: device.ProfilesServiceClient;
  private mqttBrokerClient: mqtt.MqttClient;

  // Maps "MQTT Topic" -> "Context (DeviceID, ProfileID)"
  // Used to identify the owner of the incoming message.
  private topicMap = new Map<string, SubscriptionContext>();

  // Local profile cache for fast data mapping (avoids frequent gRPC calls)
  private profileCache = new Map<string, device.ProfileResponse>();

  constructor(
    private config: ConfigService,
    private telemetryService: TelemetryService,
    @Inject('DEVICE_PACKAGE') private clientGrpc: ClientGrpc,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
  ) {
    this.profileServiceClient =
      this.clientGrpc.getService<device.ProfilesServiceClient>(
        device.PROFILES_SERVICE_NAME,
      );
  }

  // --- Configuration of connection to MQTT broker ---
  onModuleInit() {
    const url =
      this.config.get<string>('MQTT_BROKER_URL') || 'mqtt://localhost:1883';
    this.mqttBrokerClient = mqtt.connect(url);

    this.mqttBrokerClient.on('connect', () => {
      console.log('✅ [MqttService] Connected to Mosquitto');
      setTimeout(
        () => this.initializeDemoData(), // <-- Initialize hardcoded data for Demo
        10000,
      );
    });
    this.mqttBrokerClient.on('error', (err) =>
      console.error('❌ [MqttService] Error:', err),
    );
    this.mqttBrokerClient.on('message', (topic, payload) => {
      void this.handleMessage(topic, payload);
    });
  }

  onModuleDestroy() {
    this.mqttBrokerClient?.end();
  }

  // -----------------------------------------

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
      this.mqttBrokerClient.subscribe(topic);
    }
    // Update context (in case the profile changed)
    this.topicMap.set(topic, { deviceId, profileId });
  }

  /**
   * Main message handler.
   * 1. Identifies the device by topic.
   * 2. Parses the payload safely.
   * 3. Maps raw data to metrics using the Device Profile.
   * 4. Sends numeric data to TelemetryService (InfluxDB).
   * 5. Updates the Device Shadow (Redis) with the current state.
   */
  private async handleMessage(topic: string, buffer: Buffer) {
    const context = this.topicMap.get(topic);
    if (!context) return; // Ignore topics we are not subscribed to

    try {
      // 1. Safe JSON Parsing
      // We cast to 'unknown' to force type checks later.
      const messageStr = buffer.toString();
      const payload = JSON.parse(messageStr) as unknown;

      // 2. Get Profile
      // TODO: Use gRPC with caching in production
      const profile = this.profileCache.get(context.profileId); // || await this.getProfile(context.profileId);

      if (!profile || !profile.mappings) {
        this.logger.warn(`No mappings found for profile ${context.profileId}`);
        return;
      }

      // Prepare an object to collect the current state (for Redis)
      const currentState: Record<string, string | number | boolean> = {};
      const timestamp = new Date();

      // 3. Iterate mappings
      for (const [metricKey, jsonPath] of Object.entries(profile.mappings)) {
        // Extract raw value safely using our Generic Helper
        // We expect primitive types: string, number, or boolean

        const rawValue = this.extractValueByPath<string | number | boolean>(
          payload,
          jsonPath,
        );
        console.log(
          'revice metrics payload: ',
          payload,
          'jsonPath: ',
          jsonPath,
          'rawValue: ',
          rawValue,
        );

        // If value is missing, skip
        if (rawValue === undefined || rawValue === null) continue;

        // --- A. Telemetry Logic (History) ---
        // InfluxDB mainly stores numbers. We try to convert.
        const numericValue = Number(rawValue);
        if (!isNaN(numericValue)) {
          this.telemetryService.publish({
            deviceId: context.deviceId,
            timestamp: timestamp,
            metricType: metricKey,
            value: numericValue,
          });
        }

        // --- B. Device Shadow Logic (Real-time State) ---
        // For Redis, we keep the actual value (even if it's a string like "ON")
        currentState[metricKey] = rawValue;
      }

      // 4. Update Redis Shadow
      // If we extracted at least one valid metric, update the state
      if (Object.keys(currentState).length > 0) {
        // Add metadata
        currentState['lastSeen'] = timestamp.toISOString();

        await this.updateDeviceShadow(context.deviceId, currentState);
      }
    } catch (error) {
      // Safe error logging
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to process message from ${topic}: ${errorMessage}`,
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
      this.logger.error(`[MQTT] Failed to fetch profile ${profileId}`, e);
    }
    return null;
  }

  /**
   * Safely extracts a value from a nested object using a dot-notation path.
   * Uses Generics <T> to allow the caller to specify expected return type.
   *
   * @example extractValueByPath<number>(payload, "ENERGY.Voltage")
   */
  private extractValueByPath<T = unknown>(
    obj: unknown,
    path: string,
  ): T | undefined {
    const keys = path.split('.');

    const result: unknown = keys.reduce((acc: unknown, key: string) => {
      if (isRecord(acc) && key in acc) {
        return acc[key];
      }

      return undefined;
    }, obj);

    return result as T | undefined;
  }

  /**
   * Update device state in Redis.
   * Used HSET (Hash Set) to save device fields.
   * Key: device:{id}:state
   */
  private async updateDeviceShadow(
    deviceId: string,
    state: Record<string, any>,
  ) {
    const key = `device:${deviceId}:state`;

    try {
      await this.redis.hset(key, state);
      console.log(`💾 Shadow updated for ${deviceId}`);
    } catch (e) {
      this.logger.error(`Failed to update Redis shadow for ${deviceId}`, e);
    }
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
}
