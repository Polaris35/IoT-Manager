import { GroupEntity } from '@entities';

export type GroupWithCount = GroupEntity & { devicesCount: number };
