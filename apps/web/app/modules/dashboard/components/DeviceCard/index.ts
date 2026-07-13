import { DeviceCard } from "./DeviceCard";
import { withLiveMetrics } from "./withLiveMetrics";

export { DeviceCard };
export { DeviceCardSkeleton } from "./DeviceCardSkeleton";

export const SmartDeviceCard = withLiveMetrics(DeviceCard);
