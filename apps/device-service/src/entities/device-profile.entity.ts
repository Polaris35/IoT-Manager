import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryColumn,
} from 'typeorm';
import { DeviceEntity } from './device.entity';

export enum DeviceProfileProtocol {
  MQTT = 'MQTT',
  ZIGBEE = 'ZIGBEE',
  TUYA = 'TUYA',
  HTTP = 'HTTP',
  WIFI = 'WIFI',
}

@Entity('device_profiles')
export class DeviceProfileEntity {
  /** Unique identifier for the device profile */
  @PrimaryColumn()
  id: string;

  /** The name used to search for or identify the device profile */
  @Column({ unique: true })
  name: string;

  /** The name of the company that manufactured the device */
  @Column()
  vendor: string;

  /** A description of the device */
  @Column({ nullable: true })
  description: string;

  /** The communication protocol used by the device (e.g., MQTT, Zigbee) */
  @Column({
    type: 'enum',
    enum: DeviceProfileProtocol,
    default: 'MQTT',
  })
  protocol: string;

  /** JSON mapping configuration to translate device-specific data to the system format */
  @Column({ type: 'jsonb', default: {} })
  mappings: Record<string, any>;

  @OneToMany(() => DeviceEntity, (device) => device.profile)
  devices: DeviceEntity[];

  @CreateDateColumn()
  createdAt: Date;
}
