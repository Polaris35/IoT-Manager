import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { GroupEntity } from './group.entity';
import { DeviceProfileEntity } from './device-profile.entity';

export enum DeviceEntityProtocol {
  MQTT = 'MQTT',
  ZIGBEE = 'ZIGBEE',
  TUYA = 'TUYA',
}

@Entity('devices')
export class DeviceEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  name: string;

  @Column({ unique: true })
  externalId: string;

  @Column({ type: 'enum', enum: DeviceEntityProtocol })
  protocol: string;

  @Column({ nullable: true })
  groupId: string;

  @ManyToOne(() => GroupEntity, (group) => group.devices, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'groupId' })
  group: GroupEntity;

  @ManyToOne(() => DeviceProfileEntity, (profile) => profile.devices)
  @JoinColumn({ name: 'profileId' })
  profile: DeviceProfileEntity;

  @Column()
  profileId: string;

  @Column({ type: 'jsonb', default: {} })
  credentials: Record<string, any>;
}
