export class CredentialsLoginDto {
  email: string;
  password: string;
}

export class ProvidersLoginDto {
  accessGrantToken: string;
}

export type LoginDto = CredentialsLoginDto | ProvidersLoginDto;
