import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

export type DeviceMetrics = Record<string, string | number>;

type DeviceLiveMetric = {
  deviceId: string;
  lastSeen: number;
  metrics: DeviceMetrics;
};

type DeviceStore = {
  devices: Record<string, DeviceLiveMetric>;

  updateMetric: (
    deviceId: string,
    metricKey: string,
    metricValue: string | number,
  ) => void;
  updateMetricsBatch: (deviceId: string, newMetrics: DeviceMetrics) => void;
  clear: () => void;
};

export const useDeviceStore = create<DeviceStore>()(
  immer((set) => ({
    devices: {},

    updateMetric: (deviceId, metricKey, metricValue) =>
      set((state) => {
        if (!state.devices[deviceId]) {
          state.devices[deviceId] = {
            deviceId,
            lastSeen: Date.now(),
            metrics: {},
          };
        }

        const device = state.devices[deviceId];
        device.lastSeen = Date.now();
        device.metrics[metricKey] = metricValue;
      }),
    updateMetricsBatch: (deviceId, newMetrics) =>
      set((state) => {
        if (!state.devices[deviceId]) {
          state.devices[deviceId] = {
            deviceId,
            lastSeen: Date.now(),
            metrics: {},
          };
        }

        const device = state.devices[deviceId];
        device.lastSeen = Date.now();

        Object.assign(device.metrics, newMetrics);
      }),
    clear: () => set({ devices: {} }),
  })),
);
