import { Account, AccountProvider } from '@entities';
import { ProvidersLoginDto } from '../dto/login.dto';
import { Provider } from './provider.interface';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { OAuth2Client, TokenPayload } from 'google-auth-library';
import { ConfigService } from '@nestjs/config';
import { GrpcUnauthenticatedException } from 'nestjs-grpc-exceptions';

export class GoogleProvider implements Provider<ProvidersLoginDto> {
  private googleClient: OAuth2Client;
  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(Account)
    private accountsRepository: Repository<Account>,
  ) {
    this.googleClient = new OAuth2Client(
      this.configService.get('GOOGLE_CLIENT_ID'),
      this.configService.get('GOOGLE_CLIENT_SECRET'),
      'postmessage',
    );
  }
  async authorize(dto: ProvidersLoginDto): Promise<Account> {
    const idToken = await this.exchangeGrantToken(dto.code);

    const payload = await this.getUserData(idToken);
    const { email, name } = payload;

    const account = await this.accountsRepository.findOneBy({
      email,
    });

    if (account && account.provider === AccountProvider.GOOGLE) {
      return account;
    }

    return this.accountsRepository.save({
      email,
      fullName: name,
      provider: AccountProvider.GOOGLE,
    });
  }

  private async getUserData(idToken: string): Promise<TokenPayload> {
    const ticket = await this.googleClient.verifyIdToken({
      idToken: idToken,
      audience: this.configService.get('GOOGLE_CLIENT_ID'),
    });

    const payload = ticket.getPayload();

    if (!payload) {
      throw new GrpcUnauthenticatedException('Invalid Google token');
    }

    return payload;
  }

  private async exchangeGrantToken(authorizationCode: string): Promise<string> {
    const { tokens } = await this.googleClient.getToken(authorizationCode);

    if (!tokens.id_token) {
      throw new GrpcUnauthenticatedException('Invalid Google token');
    }
    return tokens.id_token;
  }
}
