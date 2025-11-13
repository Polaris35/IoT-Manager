import { Token } from '@entities';

export interface Tokens {
  accessToken: string;
  refreshToken: Token;
}

export interface JwtPayload {
  id: string;
  email: string;
}

export interface AccessTokenPayload extends JwtPayload {
  iat: number;
  exp: number;
}
