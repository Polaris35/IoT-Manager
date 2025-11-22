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
  /** Primary key for relations */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** Account id from jwt token */
  @Column()
  userId: string;

  /** Displayed name of device */
  @Column()
  name: string;

  @Column({ unique: true })
  externalId: string;

  /** The Protocol for communication with a device */
  @Column({ type: 'enum', enum: DeviceEntityProtocol })
  protocol: string;

  /** Id id of a group where device will be displayed */
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

  /** The Profile wich used for handle device response */
  @Column()
  profileId: string;

  /** Addictional information for connections. For Tuya Wi-Fi localKey and version, for HTTP token */
  @Column({ type: 'jsonb', default: {} })
  credentials: Record<string, any>;
}
