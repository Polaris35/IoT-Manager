import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { DeviceEntity } from './device.entity';

@Entity('groups')
export class GroupEntity {
  /** Unique identifier for the group */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** The ID of the user who owns this group */
  @Column()
  userId: string;

  /** The name of the group */
  @Column()
  name: string;

  /** The name of the group */
  @Column({ nullable: true })
  description: string;

  /** List of devices assigned to this group */
  @OneToMany(() => DeviceEntity, (device) => device.group)
  devices: DeviceEntity[];

  /** Timestamp when the group was created */
  @CreateDateColumn()
  createdAt: Date;
}
