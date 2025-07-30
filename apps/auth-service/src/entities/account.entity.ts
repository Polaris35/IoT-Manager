import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Token } from './token.entity';

export enum AccountProvider {
  GOOGLE = 'google',
  CREDENTIALS = 'credentials',
}

@Entity()
export class Account {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  fullName: string;

  @Column({ type: 'enum', enum: AccountProvider })
  provider: AccountProvider;

  @Column({ unique: true })
  email: string;

  @Column({
    nullable: true,
    default: null,
  })
  password: string;

  @OneToMany(() => Token, (token) => token.account)
  tokens: Token[];

  @CreateDateColumn()
  createdAt: Date;
  @CreateDateColumn()
  updatedAt: Date;
}
