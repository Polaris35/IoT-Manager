import { Module } from '@nestjs/common';
import { TokenService } from './token.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account, Token } from '@entities';
import { JwtModule } from '@nestjs/jwt';
import { options } from './config';
// import KeyvRedis from '@keyv/redis';
// import { CacheModule } from '@nestjs/cache-manager';
// import { ConfigService } from '@nestjs/config';

@Module({
  providers: [TokenService],
  imports: [
    TypeOrmModule.forFeature([Account, Token]),
    JwtModule.registerAsync(options()),
    // CacheModule.registerAsync({
    //   inject: [ConfigService],
    //   useFactory: (configService: ConfigService) => {
    //     return {
    //       stores: [new KeyvRedis(configService.get<string>('REDIS_URL'))],
    //     };
    //   },
    // }),
  ],
  exports: [TokenService],
})
export class TokenModule {}
