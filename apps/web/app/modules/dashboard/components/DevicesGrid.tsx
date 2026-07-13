import { useGetUserDevices } from "~/api/endpoints/devices";
import toast from "react-hot-toast";
import { SmartDeviceCard, DeviceCardSkeleton } from "./DeviceCard";

export function DevicesGrid() {
  const devicesQuery = useGetUserDevices();

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
    <div className="grid grid-cols-3 gap-3">
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
