import { Account, Token } from '@entities';
import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AccessTokenPayload, Tokens } from './interfaces';
import { v4 } from 'uuid';
import { add } from 'date-fns';
import {
  GrpcUnauthenticatedException,
  GrpcUnknownException,
} from 'nestjs-grpc-exceptions';
import { ConfigService } from '@nestjs/config';
import { ValidateTokenResponse } from '@iot-manager/proto';

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
  ) {}

  async refreshToken(refreshTokens: string, agent: string): Promise<Tokens> {
    const token = await this.tokenRepository.findOne({
      where: {
        token: refreshTokens,
      },
      relations: ['account'],
    });
    if (!token || token.exp < new Date()) {
      throw new GrpcUnauthenticatedException(
        "don't have token or token expired",
      );
    }

    await this.tokenRepository.delete({ token: refreshTokens });
    const account = await this.accountRepository.findOneBy({
      id: token.account.id,
    });
    return this.generateTokens(account!, agent);
  }

  async generateTokens(account: Account, agent: string): Promise<Tokens> {
    const accessToken = await this.jwtService.signAsync({
      id: account.id,
      email: account.email,
    });

    const refreshToken = await this.getRefreshToken(account.id, agent);

    return { accessToken, refreshToken };
  }

  async getRefreshToken(accountId: string, agent: string): Promise<Token> {
    const [tokenId] = (
      await this.tokenRepository.upsert(
        {
          token: v4(),
          exp: add(new Date(), { months: 1 }),
          account: {
            id: accountId,
          },
          userAgent: agent,
        },
        ['token'],
      )
    ).raw as { id: string }[];

    const token = await this.tokenRepository.findOneBy({ id: tokenId.id });
    if (!token) {
      this.logger.error("Can't find updated token with id: " + tokenId.id);
      throw new GrpcUnknownException(
        "Can't find updated token with id: " + tokenId.id,
      );
    }
    return token;
  }

  async validateAccessToken(
    accessToken: string,
  ): Promise<ValidateTokenResponse> {
    try {
      const data = await this.jwtService.verifyAsync<AccessTokenPayload>(
        accessToken,
        {
          secret: this.configSerice.get<string>('JWT_SECRET'),
        },
      );

      const response: ValidateTokenResponse = {
        id: data.id,
        email: data.email,
        // * 1000 for converting seconds to milliseconds
        iat: new Date(data.iat * 1000).toISOString(),
        exp: new Date(data.exp * 1000).toISOString(),
      };

      return response;
    } catch (error) {
      throw new GrpcUnauthenticatedException(
        error.message || 'Invalid or expired token',
      );
    }
  }

  deleteRefreshToken(token: string) {
    return this.tokenRepository.delete({
      token,
    });
  }
}
