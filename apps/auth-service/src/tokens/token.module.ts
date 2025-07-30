import { Module } from '@nestjs/common';
import { TokenService } from './token.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account, Token } from '@entities';
import { JwtModule } from '@nestjs/jwt';
import { options } from './config';

@Module({
  providers: [TokenService],
  imports: [
    TypeOrmModule.forFeature([Account, Token]),
    JwtModule.registerAsync(options()),
  ],
  exports: [TokenService],
})
export class TokenModule {}
