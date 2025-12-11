export class MqttConnectionConfigDto {
  stateTopic: string;
  commandTopic?: string;
}

export class ZigbeeConnectionConfigDto {
  topicPrefix?: string;
}
