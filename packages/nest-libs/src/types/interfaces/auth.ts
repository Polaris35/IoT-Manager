export class Token {
  id: string;
  token: string;
  exp: Date;
  userAgent: string;
}

export interface Tokens {
  accessToken: string;
  refreshToken: Token;
}

export interface JwtPayload {
  id: number;
  email: string;
}
