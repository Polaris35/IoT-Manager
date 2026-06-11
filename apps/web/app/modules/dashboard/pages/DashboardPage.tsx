import { DeviceCard } from "../components/DeviceCard";

export const deviceMetricData = [
  { name: "temperature", value: 16.03, unit: "°C" },
];

export const deviceHistoryData = [
  { timestamp: Date.now(), value: 16.03, unit: "°C" },
  { timestamp: Date.now(), value: 16.36, unit: "°C" },
  { timestamp: Date.now(), value: 15.5, unit: "°C" },
  { timestamp: Date.now(), value: 16.1, unit: "°C" },
  { timestamp: Date.now(), value: 16.45, unit: "°C" },
  { timestamp: Date.now(), value: 16.8, unit: "°C" },
];

export default function DashboardPage() {
  return (
    <div className="grid grid-cols-2 space-x-4">
      <DeviceCard
        deviceName={"Xiaomi trash thing"}
        lastSeeing={"2h ago"}
        isActive={true}
        onMetricClick={function (): void {
          throw new Error("Function not implemented.");
        }}
        graphicsData={deviceHistoryData}
        metrics={deviceMetricData}
        activeMetric={null}
      />
      <p>Dashboard Page - Protected Content</p>
    </div>
  );
}
