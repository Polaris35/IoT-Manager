export class AccountWithTokens {
  account: Account;
  accessToken: string;
  refreshToken: RefreshToken;
}

export class Account {
  id: string;
  fullName: string;
  email: string;
}

export class RefreshToken {
  token: string;
  exp: Date;
  userAgent: string;
}
