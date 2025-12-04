import { AccountProvider } from '@entities';
import { Provider } from './provider.interface';
import { CredentialsLoginDto, ProvidersLoginDto } from '../dto/login.dto';

export type ProviderMap = {
  [AccountProvider.CREDENTIALS]: Provider<CredentialsLoginDto>;
  [AccountProvider.GOOGLE]: Provider<ProvidersLoginDto>;
};
