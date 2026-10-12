import React from "react";
import DeviceThermostatIcon from "@mui/icons-material/DeviceThermostat";
import WaterDropIcon from "@mui/icons-material/WaterDrop";
import BatteryChargingFullIcon from "@mui/icons-material/BatteryChargingFull";
import PowerSettingsNewIcon from "@mui/icons-material/PowerSettingsNew";
import SensorsIcon from "@mui/icons-material/Sensors";
import BoltIcon from "@mui/icons-material/Bolt";
import SpeedIcon from "@mui/icons-material/Speed";
import WifiIcon from "@mui/icons-material/Wifi";
import DirectionsRunIcon from "@mui/icons-material/DirectionsRun";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import TouchAppIcon from "@mui/icons-material/TouchApp";
import WbSunnyIcon from "@mui/icons-material/WbSunny";
import type { ProfileMappingDef } from "~/types/profile";

import uiConfig from "./metrics.json";

const ICON_REGISTRY: Record<string, React.ElementType> = {
  thermostat: DeviceThermostatIcon,
  waterDrop: WaterDropIcon,
  battery: BatteryChargingFullIcon,
  power: PowerSettingsNewIcon,
  bolt: BoltIcon,
  speed: SpeedIcon,
  wifi: WifiIcon,
  run: DirectionsRunIcon,
  door: MeetingRoomIcon,
  warning: WarningAmberIcon,
  click: TouchAppIcon,
  sun: WbSunnyIcon,
  default: SensorsIcon,
};

const FORMAT_REGISTRY: Record<string, (v: any, unit: string) => string> = {
  float1: (v, unit) => `${Number(v).toFixed(1)} ${unit}`.trim(),
  float2: (v, unit) => `${Number(v).toFixed(2)} ${unit}`.trim(),
  round: (v, unit) => `${Math.round(v)} ${unit}`.trim(),
  powerState: (v) =>
    v === 1 || String(v).toUpperCase() === "ON" || v === true ? "On" : "Off",
  contactState: (v) => (v === false || v === 0 ? "Open" : "Close"),
  occupancyState: (v) => (v === true || v === 1 ? "Detected" : "Clear"),
  alertState: (v) => (v === true || v === 1 ? "⚠️ Alarm" : "OK"),
  raw: (v, unit) => `${String(v)} ${unit}`.trim(),
};

export const getMetricConfig = (
  metricKey: string,
  backendDef?: ProfileMappingDef,
) => {
  const safeKey = metricKey.toLowerCase();
  const rawConfig = (uiConfig as Record<string, any>)[safeKey];

  const unit = backendDef?.unit || "";

  const getFormatter = () => {
    if (rawConfig && FORMAT_REGISTRY[rawConfig.formatType]) {
      return FORMAT_REGISTRY[rawConfig.formatType];
    }

    if (backendDef?.type === "boolean") {
      if (safeKey.includes("contact")) return FORMAT_REGISTRY["contactState"];
      if (safeKey.includes("occup")) return FORMAT_REGISTRY["occupancyState"];
      if (safeKey.includes("leak") || safeKey.includes("smoke"))
        return FORMAT_REGISTRY["alertState"];
      return FORMAT_REGISTRY["powerState"];
    }

    if (backendDef?.type === "float") {
      return FORMAT_REGISTRY["float1"];
    }
    return FORMAT_REGISTRY["raw"];
  };

  const formatter = getFormatter();

  return {
    label: rawConfig?.label || metricKey,
    mainColor: rawConfig?.color || "#9e9e9e",
    bgColor: rawConfig?.bg || "#fafafa",
    icon: ICON_REGISTRY[rawConfig?.iconName] || ICON_REGISTRY["default"],
    format: (val: any) => formatter(val, unit),
  };
};
