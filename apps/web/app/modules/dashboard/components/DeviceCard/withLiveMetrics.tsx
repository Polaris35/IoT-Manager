import type { DeviceCardProps } from "./DeviceCard";

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

    const finalProps = {
      ...restProps,
      deviceName: name,
      lastSeeing: "",
      isActive: false,
      activeMetric: null,
      onMetricClick: (metricName: string) => {},
      metrics: [],
      graphicsData: [],
    } as unknown as T;
    return <Component {...finalProps} />;
  };
}
