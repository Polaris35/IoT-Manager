import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

export const REDIS_CLIENT = 'REDIS_CLIENT';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: REDIS_CLIENT,
      useFactory: (config: ConfigService) => {
        const url = config.get<string>('REDIS_URL');

        if (!url) {
          throw new Error('REDIS_URL is not defined');
        }

        // Подключаемся
        const client = new Redis(url, {
          // ВАЖНО ДЛЯ ОБЛАКА: Настройки SSL
          // Если Upstash использует публичные сертификаты, это должно работать.
          // Если будут ошибки "self signed certificate", добавим rejectUnauthorized: false
          tls: {
            rejectUnauthorized: false, // Для пет-проектов это безопасный фикс проблем с SSL
          },
        });

        client.on('connect', () =>
          console.log('✅ Connected to Upstash Redis'),
        );
        client.on('error', (err) => console.error('❌ Redis Error:', err));

        return client;
      },
      inject: [ConfigService],
    },
  ],
  exports: [REDIS_CLIENT],
})
export class RedisClientModule {}
