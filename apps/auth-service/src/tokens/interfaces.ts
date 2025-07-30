import { Token } from '@entities';

export interface Tokens {
  accessToken: string;
  refreshToken: Token;
}

export interface JwtPayload {
  id: number;
  email: string;
}
