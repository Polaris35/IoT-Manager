import { Account, Token } from '@entities';
import {
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tokens } from './interfaces';
import { v4 } from 'uuid';
import { add } from 'date-fns';

@Injectable()
export class TokenService {
  logger = new Logger(TokenService.name);
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(Token)
    private readonly tokenRepository: Repository<Token>,
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
  ) {}

  async refreshToken(refreshTokens: string, agent: string): Promise<Tokens> {
    const token = await this.tokenRepository.findOneBy({
      token: refreshTokens,
    });

    if (!token || token.exp < new Date()) {
      throw new UnauthorizedException();
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

    // this.logger.log(this.getDataFromAccessToken(accessToken));
    const refreshToken = await this.getRefreshToken(account.id, agent);

    return { accessToken, refreshToken };
  }

  async getRefreshToken(accountId: string, agent: string): Promise<Token> {
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
    );

    const token = (await this.tokenRepository.findOne({
      where: {
        account: {
          id: accountId,
        },
        userAgent: agent,
      },
    })) as Token;

    const newToken = await this.tokenRepository.findOne({
      where: { token: token.token },
    });

    if (!newToken) {
      this.logger.error(
        `token not found, accountId: ${accountId}, user-agent: ${agent}`,
      );
      throw new NotFoundException('Token not found');
    }
    return newToken;
  }

  //   getDataFromAccessToken(token: string) {
  //     const payload = this.jwtService.decode(token);
  //     return payload;
  //   }

  deleteRefreshToken(token: string) {
    return this.tokenRepository.delete({
      token,
    });
  }
}
