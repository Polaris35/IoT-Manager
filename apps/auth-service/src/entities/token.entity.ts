import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Account } from './account.entity';

@Entity()
export class Token {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, nullable: false })
  token: string;

  @Column({ nullable: false })
  exp: Date;

  @Column({ nullable: false })
  userAgent: string;

  @ManyToOne(() => Account, (account) => account.tokens)
  account: Account;
}
