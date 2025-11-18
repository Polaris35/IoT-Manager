import { Module } from '@nestjs/common';
import { TokenService } from './token.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account, Token } from '@entities';
import { JwtModule } from '@nestjs/jwt';
import { options } from './config';
import KeyvRedis from '@keyv/redis';
import { Keyv } from 'cacheable';
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
            new Keyv(new KeyvRedis('redis://localhost:6379'), {
              namespace: 'myapp',
            }),
          ],
        };
      },
    }),
  ],
  exports: [TokenService],
})
export class TokenModule {}
