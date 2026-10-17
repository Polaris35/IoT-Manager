import { API_URL } from "~/constants";
import { useDeviceLiveMetricsStore } from "~/store/useLiveMetricsStore";

class SseService {
  private eventSource: EventSource | null = null;

  public connect(token: string) {
    // Prevent duplicate connections
    if (this.eventSource) {
      return;
    }

    console.log("🌐 [SSE] Opening connection...");
    const url = API_URL + `/stream/events?token=${token}`;
    this.eventSource = new EventSource(url);

    // --- CONNECTION HANDLERS ---

    this.eventSource.onopen = () => {
      console.log("✅ [SSE] Connected to stream");
    };

    this.eventSource.onerror = (error) => {
      console.error("❌ [SSE] Connection error or lost:", error);
      // Native EventSource reconnects automatically.
      // We don't need to close it here unless we want to stop retrying.
    };

    // --- EVENT LISTENERS ---

    this.eventSource.addEventListener("metrics", (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        // console.log(event.data);

        useDeviceLiveMetricsStore
          .getState()
          .updateMetric(data.deviceId, data.metricType, data.value);
      } catch (e) {
        console.error("[SSE] Failed to parse metrics data", e);
      }
    });
  }

  public disconnect() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
      console.log("🛑 [SSE] Disconnected by client");
    }
  }
}

export const sseService = new SseService();
