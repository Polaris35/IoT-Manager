export interface Tokens {
  accessToken: string;
  refreshToken: string;
}

export interface JwtPayload {
  id: string;
  email: string;
}

export interface AccessTokenPayload extends JwtPayload {
  iat: number;
  exp: number;
}
