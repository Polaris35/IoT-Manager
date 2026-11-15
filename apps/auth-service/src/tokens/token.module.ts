import { Module } from '@nestjs/common';
import { TokenService } from './token.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account, Token } from '@entities';
import { JwtModule } from '@nestjs/jwt';
import { options } from './config';
import { CacheModule, CacheOptions } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';
import KeyvRedis from '@keyv/redis';
import Keyv from 'keyv';

@Module({
  providers: [TokenService],
  imports: [
    TypeOrmModule.forFeature([Account, Token]),
    JwtModule.registerAsync(options()),
    CacheModule.registerAsync({
      isGlobal: true,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const url = configService.get<string>('REDIS_URL');

        if (!url) {
          throw new Error('REDIS_URL is not defined');
        }

        const redisStore = new KeyvRedis(url);

        const keyv = new Keyv({ store: redisStore });

        keyv.on('error', (err) => {
          const errorMessage = err instanceof Error ? err.message : String(err);
          console.error('❌ Keyv Redis Error:', errorMessage);
        });

        const cacheOptions: CacheOptions = {
          stores: [keyv],
        };
        return cacheOptions;
      },
    }),
  ],
  exports: [TokenService],
})
export class TokenModule {}
