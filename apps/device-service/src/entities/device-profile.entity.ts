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
  @PrimaryColumn()
  id: string;

  /** Name witch used for searching needed device  */
  @Column({ unique: true })
  name: string;

  /** Name of company who develope device */
  @Column()
  vendor: string;

  /** Description of device */
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
