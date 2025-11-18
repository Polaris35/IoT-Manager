import { Module } from '@nestjs/common';
import { TokenService } from './token.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account, Token } from '@entities';
import { JwtModule } from '@nestjs/jwt';
import { options } from './config';
import KeyvRedis from '@keyv/redis';
import { Keyv } from 'cacheable';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';

@Module({
  providers: [TokenService],
  imports: [
    TypeOrmModule.forFeature([Account, Token]),
    JwtModule.registerAsync(options()),
    CacheModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          stores: [
            new Keyv(new KeyvRedis(configService.get<string>('REDIS_URL')), {
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
