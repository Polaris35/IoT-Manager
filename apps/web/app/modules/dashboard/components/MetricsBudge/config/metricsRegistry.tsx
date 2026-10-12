import DeviceThermostatIcon from "@mui/icons-material/DeviceThermostat";
import WaterDropIcon from "@mui/icons-material/WaterDrop";
import BatteryChargingFullIcon from "@mui/icons-material/BatteryChargingFull";
import PowerSettingsNewIcon from "@mui/icons-material/PowerSettingsNew";
import SensorsIcon from "@mui/icons-material/Sensors";

import metricsConfig from "./metrics.json";

const ICON_REGISTRY: Record<string, React.ElementType> = {
  thermostat: DeviceThermostatIcon,
  waterDrop: WaterDropIcon,
  battery: BatteryChargingFullIcon,
  power: PowerSettingsNewIcon,
  default: SensorsIcon,
};

const FORMAT_REGISTRY: Record<string, (value: any, unit: string) => string> = {
  float1: (v, unit) => `${Number(v).toFixed(1)} ${unit}`,
  float2: (v, unit) => `${Number(v).toFixed(2)} ${unit}`,
  round: (v, unit) => `${Math.round(v)} ${unit}`,
  booleanOnOff: (v) => (v === 1 || v === "ON" || v === true ? "On" : "Off"),
  raw: (v, unit) => `${String(v)} ${unit}`,
};

export const getMetricConfig = (metricKey: string) => {
  const rawConfig = (metricsConfig as Record<string, any>)[
    metricKey.toLowerCase()
  ];

  if (rawConfig) {
    return {
      label: rawConfig.label,
      mainColor: rawConfig.mainColor,
      bgColor: rawConfig.bgColor,
      icon: ICON_REGISTRY[rawConfig.iconName] || ICON_REGISTRY["default"],
      format: (val: any) => {
        const formatter =
          FORMAT_REGISTRY[rawConfig.formatType] || FORMAT_REGISTRY["raw"];
        return formatter(val, rawConfig.unit);
      },
    };
  }

  return {
    label: metricKey,
    icon: ICON_REGISTRY["default"],
    mainColor: "#9e9e9e",
    bgColor: "#fafafa",
    format: (val: any) => `${String(val)}`,
  };
};
