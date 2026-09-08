import { useDeviceLiveMetricsStore } from "~/store";
import type { DeviceCardProps } from "./DeviceCard";
import { useEffect } from "react";

export interface LiveMetricsExternalProps {
  id: string;
  name: string;
}

export function withLiveMetrics<T extends DeviceCardProps>(
  Component: React.ComponentType<T>,
) {
  type WrappedProps = Omit<T, keyof DeviceCardProps> & LiveMetricsExternalProps;
  return function WrappedComponent(props: WrappedProps) {
    const { id, name, ...restProps } = props;
    const deviceWithMetrics = useDeviceLiveMetricsStore(
      (state) => state.devices[id],
    );

    console.log("withLiveMetrics: ", deviceWithMetrics);

    const rawMetrics = deviceWithMetrics?.metrics ?? {};
    const formattedMetrics = Object.entries(rawMetrics).map(([key, value]) => ({
      name: key,
      value,
    }));

    const finalProps = {
      ...restProps,
      deviceName: name,
      lastSeeing: deviceWithMetrics?.lastSeen,
      isActive: false,
      activeMetric: null,
      onMetricClick: (metricName: string) => {},
      metrics: formattedMetrics,
      graphicsData: [],
    } as unknown as T;
    return <Component {...finalProps} />;
  };
}
