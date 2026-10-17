import { useDeviceLiveMetricsStore } from "~/store";
import { type DeviceCardProps, graphicTimeInterval } from "./DeviceCard";
import { useEffect, useState } from "react";
import { useFetchDeviceStats } from "~/api/endpoints/statistics";
import { formatLastSeen } from "~/utils/formatLastSeen";
import { useGetProfile } from "~/api/endpoints/profiles";
import { DateTime } from "luxon";
import { MetricRange } from "~/api/schemas";

export interface LiveMetricsExternalProps {
  id: string;
  profileId: string;
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

    const [graphicInterval, setGraphicInterval] = useState<MetricRange>();
    const getLatestAnchoredMetricsMutation = useFetchDeviceStats();

    const { id, name, ...restProps } = props;
    const profileQuery = useGetProfile(props.profileId, {
      query: {
        staleTime: 1000 * 60 * 60 * 24, // 24 hours
        gcTime: 1000 * 60 * 60 * 24 * 7, // 7 days
      },
    });

    useEffect(() => {
      if (currentActiveMetrics === null) {
        return;
      }
      getLatestAnchoredMetricsMutation.mutate({
        data: {
          deviceId: id,
          metricName: currentActiveMetrics,
          range: graphicInterval,
        },
      });
    }, [currentActiveMetrics, graphicInterval]);

    const deviceWithMetrics = useDeviceLiveMetricsStore(
      (state) => state.devices[id],
    );

    console.log(graphicInterval);
    const finalProps = {
      ...restProps,
      deviceName: name,
      lastSeeing: deviceWithMetrics?.lastSeen
        ? formatLastSeen(deviceWithMetrics?.lastSeen)
        : "",
      isActive: isDeviceOnline(deviceWithMetrics?.lastSeen),

      activeMetric: currentActiveMetrics,
      onMetricClick: (metricName: string) => {
        if (currentActiveMetrics === metricName) {
          return;
        }
        setCurrentActiveMetric(metricName);
      },
      graphicInterval,
      setGraphicInterval,
      metrics: deviceWithMetrics?.metrics ?? {},
      graphicsData: getLatestAnchoredMetricsMutation.data
        ? getLatestAnchoredMetricsMutation.data
        : [],

      profileMappings: profileQuery?.data?.mappings
        ? JSON.parse(profileQuery.data.mappings)
        : undefined,
    } as unknown as T;

    return <Component {...finalProps} />;
  };
}

const ONLINE_THRESHOLD_MINUTES = 2;

export function isDeviceOnline(lastSeen: number | null | undefined): boolean {
  if (!lastSeen) {
    return false;
  }

  const dt = DateTime.fromMillis(lastSeen);
  if (!dt.isValid) {
    return false;
  }
  const diffMinutes = DateTime.now().diff(dt, "minutes").minutes;
  return diffMinutes >= 0 && diffMinutes <= ONLINE_THRESHOLD_MINUTES;
}
