import { IsEnum, IsObject, IsString, IsUUID } from "class-validator";
import { DeviceProtocol } from "../types/enums";

export class DeviceCreatedEventDto {
  @IsUUID()
  id: string;

  @IsUUID()
  userId: string;

  @IsEnum(DeviceProtocol)
  protocol: DeviceProtocol;

  @IsString()
  externalId: string;

  @IsString()
  profileId: string;

  @IsObject()
  connectionConfig: unknown;
}
