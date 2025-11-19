import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
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
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column()
  vendor: string;

  @Column({ nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: DeviceProfileProtocol,
    default: 'MQTT',
  })
  protocol: string;

  @Column({ type: 'jsonb', default: {} })
  mappings: Record<string, any>;

  @OneToMany(() => DeviceEntity, (device) => device.profile)
  devices: DeviceEntity[];

  @CreateDateColumn()
  createdAt: Date;
}
