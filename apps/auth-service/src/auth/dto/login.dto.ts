export class CredentialsLoginDto {
  email: string;
  password: string;
}

export class ProvidersLoginDto {
  code: string;
}

export type LoginDto = CredentialsLoginDto | ProvidersLoginDto;
