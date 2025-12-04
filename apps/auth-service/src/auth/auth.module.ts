import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account, AccountProvider } from '@entities';
import { CredentialsProvider } from './providers/credentials.provider';
import { ProviderMap } from './providers/types';
import { TokenModule } from '@tokens/token.module';
import { GoogleProvider } from './providers/google.provider';
@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    GoogleProvider,
    CredentialsProvider,
    {
      provide: 'AUTH_PROVIDERS',
      useFactory: (
        googleProvider: GoogleProvider,
        credentialsProvider: CredentialsProvider,
      ): ProviderMap => ({
        [AccountProvider.GOOGLE]: googleProvider,
        [AccountProvider.CREDENTIALS]: credentialsProvider,
      }),
      inject: [GoogleProvider, CredentialsProvider],
    },
  ],
  imports: [TypeOrmModule.forFeature([Account]), TokenModule],
})
export class AuthModule {}
