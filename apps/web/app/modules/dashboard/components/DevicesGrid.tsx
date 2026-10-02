import { useGetUserDevices } from "~/api/endpoints/devices";
import toast from "react-hot-toast";
import { SmartDeviceCard, DeviceCardSkeleton } from "./DeviceCard";
import { useDeviceLiveMetricsStore } from "~/store";
import { useEffect } from "react";

export function DevicesGrid() {
  const devicesQuery = useGetUserDevices();
  const setDeviceMetricsBatch = useDeviceLiveMetricsStore(
    (state) => state.updateMetricsBatch,
  );

  useEffect(() => {
    if (devicesQuery.isSuccess) {
      devicesQuery.data.devices.map((device) => {
        setDeviceMetricsBatch(device.id, device.metrics);
      });
    }
  }, [devicesQuery.data]);
  if (devicesQuery.isError) {
    toast.error("Cannot load user devices list");
    console.error("Get user devices error: ", devicesQuery.error);
  }

  if (devicesQuery.isSuccess && devicesQuery.data.total === 0) {
    return (
      <div className="flex justify-center items-center h-full">
        <p>No items in list</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(250px,320px))] gap-3 w-full justify-center md:justify-start">
      {devicesQuery.isFetching && (
        <>
          <DeviceCardSkeleton />
          <DeviceCardSkeleton />
          <DeviceCardSkeleton />
        </>
      )}
      {devicesQuery.isSuccess &&
        devicesQuery.data.devices.map((device) => {
          return (
            <SmartDeviceCard
              key={device.id}
              name={device.name}
              id={device.id}
            />
          );
        })}
    </div>
  );
}
