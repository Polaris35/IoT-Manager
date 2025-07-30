import { Account } from '@entities';
import { LoginDto } from '../dto/login.dto';

export interface Provider<T extends LoginDto> {
  authorize(dto: T): Promise<Account>;
}
