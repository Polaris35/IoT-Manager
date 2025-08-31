import { Account, AccountProvider } from '@entities';
import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { genSaltSync, hashSync } from 'bcrypt';
import { ProviderMap } from './providers/types';
import { LoginDto } from './dto/login.dto';
import { Provider } from './providers';
import { TokenService } from 'src/tokens/token.service';
import { RegisterDto, LoginResponse } from '@iot-manager/proto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Account)
    private readonly accountsRepository: Repository<Account>,
    @Inject('AUTH_PROVIDERS')
    private readonly providers: ProviderMap,
    private readonly tokensServise: TokenService,
  ) {}

  async register(dto: RegisterDto): Promise<Account> {
    console.log('email: ', dto.email);
    const existedAccount = await this.accountsRepository.findOneBy({
      email: dto.email,
    });
    if (existedAccount) {
      throw new ConflictException('user with this email exist');
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
  ): Promise<LoginResponse> {
    const provider = this.providers[providerType] as Provider<T>;
    if (!provider) {
      throw new BadRequestException(`Provider ${providerType} not supported`);
    }

    const user = await provider.authorize(dto);
    const tokens = await this.tokensServise.generateTokens(user, agent);
    return {
      account: { ...user },
      tokens: {
        accessToken: tokens.accessToken,
        refreshToken: {
          ...tokens.refreshToken,
          expInMillisec: tokens.refreshToken.exp.getMilliseconds(),
        },
      },
    };
  }

  private hashPassword(password: string) {
    return hashSync(password, genSaltSync(10));
  }
}
