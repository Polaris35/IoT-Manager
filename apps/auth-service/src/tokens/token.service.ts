import { Account, Token } from '@entities';
import {
  // Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { AccessTokenPayload, Tokens } from './interfaces';
import { v4 } from 'uuid';
import { add } from 'date-fns';
import {
  GrpcUnauthenticatedException,
  GrpcUnknownException,
} from 'nestjs-grpc-exceptions';
import { ConfigService } from '@nestjs/config';
import { auth } from '@iot-manager/proto';
// import { CACHE_MANAGER } from '@nestjs/cache-manager';
// import { Cache } from 'cache-manager';

@Injectable()
export class TokenService {
  logger = new Logger(TokenService.name);
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(Token)
    private readonly tokenRepository: Repository<Token>,
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
    private readonly configSerice: ConfigService,
    // @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async refreshToken(
    refreshTokenValue: string,
    agent: string,
  ): Promise<Tokens> {
    const tokenEntity = await this.findTokenByValue(refreshTokenValue);

    if (!tokenEntity || new Date(tokenEntity.exp) < new Date()) {
      throw new GrpcUnauthenticatedException('Token not found or has expired');
    }

    await this.deleteTokenByValue(tokenEntity.token);

    const account = await this.accountRepository.findOneBy({
      id: tokenEntity.account.id,
    });
    if (!account) {
      throw new GrpcUnknownException('Account associated with token not found');
    }

    return this.generateTokens(account, agent);
  }

  async generateTokens(account: Account, agent: string): Promise<Tokens> {
    const accessToken = await this.jwtService.signAsync({
      id: account.id,
      email: account.email,
    });

    const refreshToken = await this.createAndCacheRefreshToken(
      account.id,
      agent,
    );

    return { accessToken, refreshToken };
  }

  async validateAccessToken(
    accessToken: string,
  ): Promise<auth.ValidateTokenResponse> {
    try {
      const data = await this.jwtService.verifyAsync<AccessTokenPayload>(
        accessToken,
        {
          secret: this.configSerice.get<string>('JWT_SECRET'),
        },
      );

      const response: auth.ValidateTokenResponse = {
        id: data.id,
        email: data.email,
        // * 1000 for converting seconds to milliseconds
        iat: new Date(data.iat * 1000).toISOString(),
        exp: new Date(data.exp * 1000).toISOString(),
      };

      return response;
    } catch (error) {
      throw new GrpcUnauthenticatedException(
        error.message || 'Invalid or expired  token',
      );
    }
  }

  async deleteRefreshToken(token: string): Promise<void> {
    await this.tokenRepository.delete({
      token,
    });
  }

  private async findTokenByValue(tokenValue: string) {
    // const key = `refresh-token:${tokenValue}`;

    // const cachedToken = await this.cacheManager.get<Token>(key);
    // console.log(cachedToken);
    // if (cachedToken) {
    //   this.logger.log(`Cache HIT for token!`);
    //   cachedToken.exp = new Date(cachedToken.exp);
    //   return cachedToken;
    // }

    // this.logger.log(`Cache MISS for token.`);
    const tokenFromDb = await this.tokenRepository.findOne({
      where: { token: tokenValue },
      relations: ['account'],
    });

    // if (tokenFromDb) {
    //   await this.setTokenInCache(tokenFromDb);
    // }

    return tokenFromDb;
  }

  private async createAndCacheRefreshToken(
    accountId: string,
    agent: string,
  ): Promise<Token> {
    const tokenEntity = this.tokenRepository.create({
      token: v4(),
      exp: add(new Date(), { months: 1 }),
      account: { id: accountId },
      userAgent: agent,
    });
    const savedToken = await this.tokenRepository.save(tokenEntity);

    // console.log('beginning of caching token');
    // await this.setTokenInCache(savedToken);
    // console.log('end of caching tokens');

    return savedToken;
  }

  private async deleteTokenByValue(tokenValue: string): Promise<void> {
    // const key = `refresh-token:${tokenValue}`;
    await Promise.all([
      this.tokenRepository.delete({ token: tokenValue }),
      // this.cacheManager.del(key),
    ]);
  }

  // private async setTokenInCache(token: Token): Promise<void> {
  // const key = `refresh-token:${token.token}`;
  //   const ttl = (new Date(token.exp).getTime() - Date.now()) / 1000;

  //   if (ttl > 0) {
  //     await this.cacheManager.set(key, token, ttl);
  //     this.logger.debug(
  //       'added token to cache, key: ',
  //       key,
  //       'ttl: ',
  //       ttl,
  //       'token: ',
  //       token,
  //     );
  //   }
  // }
}
