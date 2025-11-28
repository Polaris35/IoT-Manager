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
  /** Unique identifier for the device (UUID) */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** The ID of the user account (extracted from the JWT token) */
  @Column()
  userId: string;

  /** The display name of the device */
  @Column()
  name: string;

  /** Unique external identifier (e.g., hardware MAC address or serial number) */
  @Column({ unique: true })
  externalId: string;

  /** The communication protocol used by the device */
  @Column({ type: 'enum', enum: DeviceEntityProtocol })
  protocol: string;

  /** The ID of the group to which the device belongs */
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

  /** The ID of the profile used to process device data */
  @Column()
  profileId: string;

  /**
   * Additional connection credentials or configuration.
   * Examples: 'localKey' and 'version' for Tuya, or 'token' for HTTP.
   */
  @Column({ type: 'jsonb', default: {} })
  credentials: Record<string, any>;
}
