import { IsUUID } from "class-validator";

export class DeviceCurrentMetricsGetEventDto {
  @IsUUID()
  deviceId: string;
}
