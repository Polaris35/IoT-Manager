export interface ProfileMappingDef {
  targetMetric: string;
  type: "float" | "boolean" | "string" | "enum";
  unit?: string;
  factor?: number;
}

export interface ProfileCommandDef {
  param: string;
  type: "float" | "boolean" | "string" | "enum";
  min?: number;
  max?: number;
  unit?: string;
}
