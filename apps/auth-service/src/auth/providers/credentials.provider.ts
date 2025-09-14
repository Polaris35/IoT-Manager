import { Injectable } from '@nestjs/common';
import { CredentialsLoginDto } from '../dto/login.dto';
import { Account, AccountProvider } from '@entities';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { compare } from 'bcrypt';
import { Provider } from './provider.interface';
import { GrpcUnauthenticatedException } from 'nestjs-grpc-exceptions';

@Injectable()
export class CredentialsProvider implements Provider<CredentialsLoginDto> {
  constructor(
    @InjectRepository(Account)
    private accountsRepository: Repository<Account>,
  ) {}
  async authorize(dto: CredentialsLoginDto): Promise<Account> {
    const account = await this.accountsRepository.findOneBy({
      email: dto.email,
    });
    if (
      !account ||
      account.provider !== AccountProvider.CREDENTIALS ||
      (await compare(account.password, dto.password))
    ) {
      throw new GrpcUnauthenticatedException('Incorrect login or password');
    }
    return account;
  }
}
