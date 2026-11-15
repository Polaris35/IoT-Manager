# IoT Broker Service 🤖

The core integration engine of the platform. It bridges the gap between physical hardware (MQTT Broker) and the internal software ecosystem (RabbitMQ & Redis).

---

## 📌 Table of Contents

- [Responsibility](#-responsibility)
- [Architecture & Data Flow](#-architecture--data-flow)
- [Standalone Local Development](#-standalone-local-development)
- [Environment Variables](#-environment-variables)

---

## 🎯 Responsibility

- **MQTT Ingestion:** Connects to the Eclipse Mosquitto broker to receive raw telemetry and state updates from physical/emulated devices.
- **Dynamic Normalization:** Fetches rich device profiles (via gRPC) and parses raw hardware payloads into standardized metrics using dot-notation path extraction and data type normalization (factors, booleans, floats).
- **Device Shadow:** Maintains the real-time state of all connected devices in **Redis** (using Hash Sets / `HSET`) for instantaneous UI retrieval without querying time-series storage.
- **Event-Driven Publishing:** Publishes normalized telemetry streams to **RabbitMQ** (`telemetry.created`) for downstream consumption by the statistics service.
- **Command Dispatcher:** Consumes control commands from RabbitMQ (`send_command`), looks up execution rules based on device profiles, and translates them into hardware-specific MQTT commands (`json` payload mode or `topic` suffix mode).
- **Cold Start Synchronization:** Automatically syncs and subscribes to active devices from the database upon application startup.

---

## 📐 Architecture & Data Flow

1. **Telemetry Flow:**
   Device -> MQTT Broker -> `MqttService` (Parses via Profile) -> Redis (Updates Device Shadow) + RabbitMQ (Sends to Stats).
2. **Control Flow:**
   Frontend -> API Gateway -> RabbitMQ (`send_command`) -> `DeviceLifecycleController` -> `MqttService` (Formats payload/topic) -> MQTT Broker -> Device.

---

## ⚙️ Standalone Local Development

How to run this specific service locally for isolated debugging:

1. **Install dependencies (from root workspace):**

   ```bash
   pnpm install
   ```

2. **Set up environment variables:**

   ```bash
   cp .env.example .env
   cp ./apps/iot-broker-service/.env.example ./apps/iot-broker-service/.env
   ```

3. **Start infrastructure dependencies (MQTT, Redis, RabbitMQ):**

   ```bash
   docker compose up -d mosquitto-broker redis rabbitmq-broker
   ```

4. **Run service in watch mode:**

   ```Bash
   pnpm dev --filter=iot-broker-service
   ```

---

## 🔑 Environment Variables

| Variable                 | Default                      | Description                                   |
| ------------------------ | ---------------------------- | --------------------------------------------- |
| RABBITMQ_USER            | admin                        | Username for RabbitMQ connection              |
| RABBITMQ_PASSWORD        | secret_password              | Password for RabbitMQ connection              |
| RABBITMQ_HOST            | rabbitmq-broker              | Hostname for RabbitMQ broker                  |
| RABBITMQ_HOST_PORT       | 5672                         | Port for RabbitMQ connection                  |
| RABBITMQ_VHOST           | —                            | Virtual host for RabbitMQ                     |
| RABBITMQ_EVENTS_QUEUE    | iot_events_queue             | Queue name for IoT events                     |
| RABBITMQ_TELEMETRY_QUEUE | iot_telemetry_queue          | Queue name for IoT telemetry data             |
| RABBITMQ_STREAM_QUEUE    | gateway_stream_queue         | Queue name for IoT streaming data             |
| DEVICE_SERVICE_GRPC_URL  | device-service:50055         | gRPC address of the Device Management service |
| MQTT_BROKER_URL          | mqtt://mosquitto-broker:1883 | Connection string for Eclipse Mosquitto       |
| REDIS_URL                | redis://redis:6379           | Connection string for Redis (Device Shadow)   |

---
