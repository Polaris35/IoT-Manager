import { Module } from '@nestjs/common';
import { TokenService } from './token.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account, Token } from '@entities';
import { JwtModule } from '@nestjs/jwt';
import { options } from './config';
import { Cacheable, CacheableMemory, Keyv } from 'cacheable';
import KeyvRedis, { createKeyv } from '@keyv/redis';
import { ConfigService } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  providers: [TokenService],
  imports: [
    TypeOrmModule.forFeature([Account, Token]),
    JwtModule.registerAsync(options()),
    CacheModule.registerAsync({
      useFactory: () => {
        return {
          stores: [
            new Keyv({
              store: new CacheableMemory({ ttl: 60000, lruSize: 5000 }),
            }),
            new KeyvRedis('redis://localhost:6379'),
          ],
        };
      },
    }),
  ],
  exports: [TokenService],
})
export class TokenModule {}
