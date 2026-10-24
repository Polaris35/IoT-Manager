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

        const isTlsRequired =
          url.startsWith('rediss://') || url.includes('upstash.io');

        const client = new Redis(url, {
          ...(isTlsRequired && {
            tls: {
              rejectUnauthorized: false,
            },
          }),
        });

        const connectionName = isTlsRequired
          ? 'Remote TLS Redis'
          : 'Local Redis';

        client.on('connect', () =>
          console.log(`✅ Connected to ${connectionName}`),
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
