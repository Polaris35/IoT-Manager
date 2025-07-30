// import { Account } from '@entities';
// import { ProvidersLoginDto } from '../dto/login.dto';
// import { Provider } from './provider.interface';
// import { Repository } from 'typeorm';
// import { InjectRepository } from '@nestjs/typeorm';
// import { ClassSerializerInterceptor, UseInterceptors } from '@nestjs/common';

// export class GoogleProvider implements Provider<ProvidersLoginDto> {
//   constructor(
//     @InjectRepository(Account)
//     private accountsRepository: Repository<Account>,
//   ) {}
// //   authorize(dto: ProvidersLoginDto): Promise<Account> {

// //   }

// //   @UseInterceptors(ClassSerializerInterceptor)
// //   private async getUserData(token: string): Promise<Account> {

// //   }

//   private async exchangeGrantToken(grantToken:string):Promise<string> {

//   }
// }
