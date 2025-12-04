import { Account, AccountProvider } from '@entities';
import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { genSaltSync, hashSync } from 'bcrypt';
import { ProviderMap } from './providers/types';
import { LoginDto } from './dto/login.dto';
import { Provider } from './providers';
import { TokenService } from 'src/tokens/token.service';
import { auth } from '@iot-manager/proto';
import {
  GrpcAlreadyExistsException,
  GrpcInvalidArgumentException,
} from 'nestjs-grpc-exceptions';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Account)
    private readonly accountsRepository: Repository<Account>,
    @Inject('AUTH_PROVIDERS')
    private readonly providers: ProviderMap,
    private readonly tokensServise: TokenService,
  ) {}

  async register(dto: auth.RegisterRequest): Promise<Account> {
    const existedAccount = await this.accountsRepository.findOneBy({
      email: dto.email,
    });
    if (existedAccount) {
      throw new GrpcAlreadyExistsException(
        'User with this email already exist',
      );
    }

    return this.accountsRepository.save({
      ...dto,
      password: this.hashPassword(dto.password),
      provider: AccountProvider.CREDENTIALS,
    });
  }

  async authorize<T extends LoginDto>(
    dto: T,
    agent: string,
    providerType: AccountProvider,
  ): Promise<auth.LoginResponse> {
    const provider = this.providers[providerType] as Provider<T>;
    if (!provider) {
      throw new GrpcInvalidArgumentException(
        `Provider ${providerType} not supported`,
      );
    }

    const account = await provider.authorize(dto);
    const tokens = await this.tokensServise.generateTokens(account, agent);

    return {
      account,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  private hashPassword(password: string) {
    return hashSync(password, genSaltSync(10));
  }

  async getAccountById(id: string): Promise<Account> {
    const account = await this.accountsRepository.findOneBy({ id });
    if (!account) {
      throw new GrpcInvalidArgumentException(`Account with id ${id} not found`);
    }

    return account;
  }
}
