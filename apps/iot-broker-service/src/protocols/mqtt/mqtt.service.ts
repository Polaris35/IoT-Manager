import {
  Inject,
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientGrpc } from '@nestjs/microservices';
import * as mqtt from 'mqtt';
import { firstValueFrom } from 'rxjs';
import { TelemetryService } from '../../telemetry/telemetry.service';
import { device } from '@iot-manager/proto';

// Интерфейс контекста подписки
interface SubscriptionContext {
  deviceId: string;
  profileId: string;
}

@Injectable()
export class MqttService implements OnModuleInit, OnModuleDestroy {
  private profileServiceClient: device.ProfilesServiceClient;
  private client: mqtt.MqttClient;

  // 1. Обновленная карта: Топик -> { DeviceID, ProfileID }
  private topicMap = new Map<string, SubscriptionContext>();

  // 2. Кэш профилей: ProfileID -> Объект Профиля.
  // Чтобы не долбить Device Service gRPC каждую секунду.
  private profileCache = new Map<string, device.ProfileResponse>();

  constructor(
    private config: ConfigService,
    private telemetryService: TelemetryService,
    // Инжектим клиент для общения с Device Service (надо добавить в модуль!)
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

    this.client.on('connect', () =>
      console.log('✅ [MqttService] Connected to Mosquitto'),
    );
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

  // --- ОБНОВЛЕННЫЙ МЕТОД ПОДПИСКИ ---
  subscribeToDevice(deviceId: string, profileId: string, topic: string) {
    if (!topic) return;

    if (!this.topicMap.has(topic)) {
      console.log(
        `[MQTT] Subscribing to ${topic} (Device: ${deviceId}, Profile: ${profileId})`,
      );
      this.client.subscribe(topic);
    }

    this.topicMap.set(topic, { deviceId, profileId });
  }

  // --- ГЛАВНАЯ ЛОГИКА ОБРАБОТКИ ---
  private async handleMessage(topic: string, buffer: Buffer) {
    // 1. Ищем контекст
    const context = this.topicMap.get(topic);
    if (!context) return; // Не наше устройство

    const messageStr = buffer.toString();

    try {
      // 2. Парсим JSON от устройства
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const payload = JSON.parse(messageStr);

      // 3. Получаем профиль (из кэша или gRPC)
      const profile = await this.getProfile(context.profileId);

      if (!profile || !profile.mappings) {
        console.warn(
          `[MQTT] No mappings found for profile ${context.profileId}`,
        );
        return;
      }

      // 4. Бежим по маппингу профиля и вытаскиваем данные
      // mapping example: { "voltage": "ENERGY.Voltage", "temperature": "temp" }
      for (const [metricKey, jsonPath] of Object.entries(profile.mappings)) {
        // Магия извлечения значения (поддерживает вложенность a.b.c)
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const rawValue = this.extractValueByPath(payload, jsonPath);

        if (rawValue !== undefined && rawValue !== null) {
          // Приводим к числу, если это возможно
          const numericValue = Number(rawValue);

          if (!isNaN(numericValue)) {
            console.log('New parsed metrics has arrived!: ', {
              deviceId: context.deviceId,
              timestamp: new Date(),
              metricType: metricKey, // например 'voltage'
              value: numericValue,
            });
            this.telemetryService.publish({
              deviceId: context.deviceId,
              timestamp: new Date(),
              metricType: metricKey, // например 'voltage'
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

  // --- ХЕЛПЕРЫ ---

  /**
   * Получает профиль. Сначала ищет в RAM-кэше, если нет - идет по gRPC.
   */
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

      // Сохраняем в кэш
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
   * Безопасно извлекает значение из вложенного объекта по пути через точку.
   * Пример: extractValueByPath({ a: { b: 1 } }, 'a.b') -> 1
   */
  private extractValueByPath(obj: Record<string, any>, path: string): any {
    return path.split('.').reduce((acc: any, part: string) => {
      // Проверяем, что acc существует и является объектом, прежде чем лезть внутрь
      if (acc && typeof acc === 'object' && part in acc) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return
        return acc[part];
      }
      return undefined;
    }, obj);
  }
}
