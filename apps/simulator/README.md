# IoT Device Simulator 🤖

A lightweight Node.js script designed to emulate physical IoT hardware (Zigbee sensors and Tasmota/MQTT smart plugs) for testing and development purposes.

---

## 🚀 What it does

- **Telemetry Emulation:** Periodically generates and publishes realistic sensor payloads (temperature, humidity, voltage, power consumption) to the MQTT broker (Eclipse Mosquitto).
- **Command Loopback:** Subscribes to device-specific command topics (e.g., `.../set` or `cmnd/.../POWER`), listens for incoming control commands from the backend, and visually logs state changes (e.g., toggling a relay or changing calibration).

---

## ⚙️ How to Run

1. **Make sure your MQTT Broker (Mosquitto) is running via Docker:**

   ```bash
   docker compose up -d mosquitto-broker
   ```

2. **Run the simulator script:**

   ```bash
   pnpm dev --filter=simulator
   ```
