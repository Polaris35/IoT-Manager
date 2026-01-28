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

export interface MetricDefinition {
  targetMetric: string;
  type: 'float' | 'boolean' | 'string';
  unit?: string;
  factor?: number;
}

export interface CommandDefinition {
  param: string;
  type: 'float' | 'boolean' | 'string' | 'integer';
  min?: number;
  max?: number;
}

export type CachedDeviceProfile = Omit<
  device.ProfileResponse,
  'mappings' | 'commands'
> & {
  mappings: Record<string, MetricDefinition>;
  commands: Record<string, CommandDefinition>;
  commandMode: 'json' | 'topic';
};

@Injectable()
export class MqttService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(MqttService.name);
  /**
   * Profiles service gRPC client
   * used to obtain devices profile
   */
  private profileServiceClient: device.ProfilesServiceClient;
  private mqttBrokerClient: mqtt.MqttClient;

  /**
   * Maps "MQTT Topic" -> "Context (DeviceID, ProfileID)"
   * Used to identify the owner of the incoming message.
   */
  private topicMap = new Map<string, SubscriptionContext>();
  private commandTopics = new Map<string, string>();
  private deviceProfileMap = new Map<string, string>();

  // Local profile cache for fast data mapping (avoids frequent gRPC calls)
  private profileCache = new Map<string, CachedDeviceProfile>();

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
  registerDevice(
    deviceId: string,
    profileId: string,
    stateTopic: string,
    commandTopic?: string,
  ) {
    this.deviceProfileMap.set(deviceId, profileId);

    if (stateTopic) {
      // Avoid duplicate subscriptions
      if (!this.topicMap.has(stateTopic)) {
        console.log(
          `[MQTT] Subscribing to ${stateTopic} (Device: ${deviceId}, Profile: ${profileId})`,
        );
        this.mqttBrokerClient.subscribe(stateTopic);
      }
      // Update context (in case the profile changed)
      this.topicMap.set(stateTopic, { deviceId, profileId });
    }
    if (commandTopic) {
      this.commandTopics.set(deviceId, commandTopic);
      this.logger.log(`Registered CMD topic for ${deviceId}: ${commandTopic}`);
    }
  }

  /**
   * Sends a command to the device using its profile definition.
   * Handles protocol specifics (JSON vs Topic suffixes).
   *
   * @param deviceId Target Device ID
   * @param capability Command capability name (e.g., 'state', 'brightness', 'color')
   * @param value Command value (true/false, number, string)
   */
  async publishCommand(
    deviceId: string,
    capability: string,
    value: any,
  ): Promise<boolean> {
    // Find base command topic for this device
    const mainTopic = this.commandTopics.get(deviceId);
    if (!mainTopic) {
      this.logger.warn(`No command topic registered for device ${deviceId}`);
      return false;
    }

    // Retrieve device profile
    const profileId = this.deviceProfileMap.get(deviceId);
    if (!profileId) {
      this.logger.warn(`No profileId found for device ${deviceId}`);
      return false;
    }

    const profile = await this.getProfile(profileId);

    if (!profile || !profile.commands) {
      this.logger.warn(`No profile or commands found for device ${deviceId}`);
      return false;
    }

    // Find command definition in the profile
    // 'commands' is a map: { "state": { "param": "state", "type": "boolean" } }
    const commandDef = profile.commands[capability];

    if (!commandDef) {
      this.logger.warn(
        `Capability '${capability}' not found in profile ${profileId}`,
      );
      return false;
    }

    // Format/Cast value based on type definition
    const formattedValue = this.formatValue(value, commandDef);

    let finalTopic = mainTopic;
    let finalPayload = '';

    // --- SENDING STRATEGY SELECTION ---

    // Mode A: JSON (Zigbee2MQTT style)
    // Sends a JSON object to a single topic. Example: { "state": "ON" }
    if (profile.commandMode === 'json') {
      const jsonPayload = { [commandDef.param]: formattedValue };
      finalPayload = JSON.stringify(jsonPayload);
    }

    // Mode B: TOPIC (Tasmota / Legacy style)
    // Modifies the topic suffix. Example: cmnd/dev/POWER -> cmnd/dev/Dimmer
    else {
      finalTopic = this.replaceTopicSuffix(mainTopic, commandDef.param);
      finalPayload = String(formattedValue);
    }

    this.logger.log(`📢 Sending CMD to ${finalTopic}: ${finalPayload}`);

    // Publish to MQTT Broker
    return new Promise((resolve) => {
      this.mqttBrokerClient.publish(finalTopic, finalPayload, (err: Error) => {
        if (err) {
          this.logger.error(`Failed to publish command: ${err.message}`);
          resolve(false);
        } else {
          resolve(true);
        }
      });
    });
  }

  /**
   * Helper: Formats value according to profile type definition.
   * e.g., converts boolean to "ON"/"OFF", clamps numbers.
   */
  private formatValue(
    value: any,
    def: CommandDefinition,
  ): string | number | boolean {
    // Boolean logic
    if (def.type === 'boolean') {
      // Zigbee and Tasmota often prefer "ON"/"OFF" over true/false.
      // Ideally, this could be configurable in the profile, but ON/OFF is a safe default.
      const boolVal = Boolean(value);
      return boolVal ? 'ON' : 'OFF';
    }

    // Numeric logic
    if (def.type === 'float' || def.type === 'integer') {
      let num = Number(value);
      if (isNaN(num)) return 0;

      // Apply min/max constraints if defined
      if (def.min !== undefined) num = Math.max(def.min, num);
      if (def.max !== undefined) num = Math.min(def.max, num);

      return num;
    }

    return String(value);
  }

  /**
   * Helper: Replaces the last part of the topic path.
   * Example: cmnd/dev/POWER + Dimmer -> cmnd/dev/Dimmer
   */
  private replaceTopicSuffix(topic: string, newSuffix: string): string {
    const parts = topic.split('/');
    if (parts.length > 1) {
      parts.pop(); // Remove old suffix
    }
    parts.push(newSuffix); // Add new suffix
    return parts.join('/');
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
    if (!context) return;

    try {
      const messageStr = buffer.toString();
      const payload = JSON.parse(messageStr) as unknown;

      const profile = await this.getProfile(context.profileId);

      if (!profile || !profile.mappings) {
        this.logger.warn(`No mappings found for profile ${context.profileId}`);
        return;
      }

      const currentState: Record<string, string | number | boolean> = {};
      const timestamp = new Date();

      // Iterate mappings (Rich Profile Structure)
      // jsonPath - f.e. "energy.voltage"
      // metricDef - f.e. { targetMetric: "voltage", type: "float", factor: 0.001 })
      for (const [jsonPath, metricDef] of Object.entries(profile.mappings)) {
        let rawValue = this.extractValueByPath<string | number | boolean>(
          payload,
          jsonPath,
        );

        if (rawValue === undefined || rawValue === null) continue;

        if (
          metricDef.type === 'float' &&
          typeof rawValue === 'number' &&
          metricDef.factor
        ) {
          rawValue = rawValue * metricDef.factor;
        }

        // --- A. Telemetry Logic (InfluxDB) ---
        // InfluxDB accept only numbers.
        let numericValue = Number(rawValue);

        // Boolean special handling for diagrams (true=1, false=0)
        if (metricDef.type === 'boolean') {
          // if "ON"/"OFF" or true/false
          if (String(rawValue).toUpperCase() === 'ON' || rawValue === true)
            numericValue = 1;
          else if (
            String(rawValue).toUpperCase() === 'OFF' ||
            rawValue === false
          )
            numericValue = 0;
        }

        if (!isNaN(numericValue)) {
          this.telemetryService.publish({
            deviceId: context.deviceId,
            timestamp: timestamp,
            metricType: metricDef.targetMetric,
            value: numericValue,
          });
        }

        // --- Device Shadow Logic (Redis) ---
        currentState[metricDef.targetMetric] = rawValue;
      }

      // Update Redis Shadow
      if (Object.keys(currentState).length > 0) {
        currentState['lastSeen'] = timestamp.toISOString();
        await this.updateDeviceShadow(context.deviceId, currentState);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to process message from ${topic}: ${errorMessage}`,
      );
    }
  }

  private async getProfile(
    profileId: string,
  ): Promise<CachedDeviceProfile | null> {
    if (this.profileCache.has(profileId)) {
      return this.profileCache.get(profileId) as CachedDeviceProfile;
    }

    try {
      const profileObservable = this.profileServiceClient.findOne({
        id: profileId,
      });
      const rawProfile = await firstValueFrom(profileObservable);

      const profile: CachedDeviceProfile = {
        ...rawProfile,
        commands: JSON.parse(rawProfile.commands) as Record<
          string,
          CommandDefinition
        >,
        mappings: JSON.parse(rawProfile.mappings) as Record<
          string,
          MetricDefinition
        >,
        commandMode: (rawProfile.commandMode as 'json' | 'topic') || 'json',
      };

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

    // =================================================================
    // 1. ZIGBEE PROFILE (Xiaomi)
    // =================================================================
    this.profileCache.set('prof_zigbee_xiaomi_gzcgq01lm', {
      id: 'prof_zigbee_xiaomi_gzcgq01lm',
      name: 'Xiaomi Sensor (Demo)',
      vendor: 'Xiaomi',
      protocol: 'ZIGBEE',
      description: 'Demo Profile',
      commandMode: 'json',

      mappings: {
        temperature: { targetMetric: 'temperature', type: 'float' },
        humidity: { targetMetric: 'humidity', type: 'float' },
        battery: { targetMetric: 'battery', type: 'float' },
        voltage: { targetMetric: 'voltage', type: 'float', factor: 0.001 },
        state: { targetMetric: 'status', type: 'boolean' },
        brightness_percent: { targetMetric: 'brightness', type: 'float' },
      },

      commands: {
        state: { param: 'state', type: 'boolean' },
        brightness: {
          param: 'brightness_percent',
          type: 'float',
          min: 0,
          max: 100,
        },
      },
    });

    // =================================================================
    // 2. MQTT PROFILE (Sonoff Tasmota)
    // =================================================================
    this.profileCache.set('prof_wifi_sonoff_pow_r2', {
      id: 'prof_wifi_sonoff_pow_r2',
      name: 'Sonoff POW (Demo)',
      vendor: 'Sonoff',
      protocol: 'MQTT',
      description: 'Demo Profile',
      commandMode: 'topic',

      mappings: {
        POWER: { targetMetric: 'status', type: 'boolean' },
        'ENERGY.Voltage': { targetMetric: 'voltage', type: 'float' },
        'ENERGY.Power': { targetMetric: 'power', type: 'float' },
        'ENERGY.Current': { targetMetric: 'current', type: 'float' },
      },

      commands: {
        switch: { param: 'POWER', type: 'boolean' },
      },
    });

    // =================================================================
    // 3. DIY PROFILE (Simple)
    // =================================================================
    this.profileCache.set('profile_diy_weather', {
      id: 'profile_diy_weather',
      name: 'DIY ESP32',
      vendor: 'DIY',
      protocol: 'MQTT',
      description: 'Demo Profile',
      commandMode: 'json',

      mappings: {
        temp: { targetMetric: 'temperature', type: 'float' },
        status: { targetMetric: 'status', type: 'string' },
      },

      commands: {}, // Без команд
    });

    // Xiaomi
    this.registerDevice(
      'device-id-xiaomi-001',
      'prof_zigbee_xiaomi_gzcgq01lm',
      'zigbee2mqtt/sensor_kitchen', // State Topic
      'zigbee2mqtt/sensor_kitchen/set', // Command Topic
    );

    // Sonoff
    this.registerDevice(
      'device-id-sonoff-002',
      'prof_wifi_sonoff_pow_r2',
      'tele/sonoff_living_room/SENSOR', // State Topic
      'cmnd/sonoff_living_room/POWER', // Command Topic (Base)
    );

    // DIY
    this.registerDevice(
      'device-id-esp32-003',
      'profile_diy_weather',
      'devices/esp32_garage/state',
      // No commands
    );
  }
}
