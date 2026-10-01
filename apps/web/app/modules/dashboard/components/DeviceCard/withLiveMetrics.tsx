import { useDeviceLiveMetricsStore } from "~/store";
import type { DeviceCardProps } from "./DeviceCard";
import { useEffect, useState } from "react";
import { useFetchDeviceStats } from "~/api/endpoints/statistics";

export interface LiveMetricsExternalProps {
  id: string;
  name: string;
}

export function withLiveMetrics<T extends DeviceCardProps>(
  Component: React.ComponentType<T>,
) {
  type WrappedProps = Omit<T, keyof DeviceCardProps> & LiveMetricsExternalProps;
  return function WrappedComponent(props: WrappedProps) {
    const [currentActiveMetrics, setCurrentActiveMetric] = useState<
      null | string
    >(null);
    const getLatestAnchoredMetricsMutation = useFetchDeviceStats();
    const { id, name, ...restProps } = props;

    useEffect(() => {
      if (currentActiveMetrics === null) {
        return;
      }
      getLatestAnchoredMetricsMutation.mutate({
        data: { deviceId: id, metricName: currentActiveMetrics },
      });
    }, [currentActiveMetrics]);
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
      activeMetric: currentActiveMetrics,
      onMetricClick: (metricName: string) => {
        if (currentActiveMetrics === metricName) {
          return;
        }
        setCurrentActiveMetric(metricName);
      },
      metrics: formattedMetrics,
      graphicsData: getLatestAnchoredMetricsMutation.data
        ? getLatestAnchoredMetricsMutation.data
        : [],
    } as unknown as T;
    return <Component {...finalProps} />;
  };
}
