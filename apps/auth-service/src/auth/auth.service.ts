import { Account, AccountProvider } from '@entities';
import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RegisterAccountDto } from './dto/register.dto';
import { genSaltSync, hashSync } from 'bcrypt';
import { ProviderMap } from './providers/types';
import { LoginDto } from './dto/login.dto';
import { Provider } from './providers';
import { TokenService } from 'src/tokens/token.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Account)
    private readonly accountsRepository: Repository<Account>,
    @Inject('AUTH_PROVIDERS')
    private readonly providers: ProviderMap,
    private readonly tokensServise: TokenService,
  ) {}

  async register(dto: RegisterAccountDto): Promise<Account> {
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
  ) {
    const provider = this.providers[providerType] as Provider<T>;
    if (!provider) {
      throw new BadRequestException(`Provider ${providerType} not supported`);
    }

    const user = await provider.authorize(dto);
    const tokens = await this.tokensServise.generateTokens(user, agent);
    return { user, tokens };
  }

  private hashPassword(password: string) {
    return hashSync(password, genSaltSync(10));
  }
}
