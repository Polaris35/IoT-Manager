# Statistics Service 📊

The high-throughput analytics sink of the IoT platform. It consumes asynchronous telemetry streams from the message broker and persists time-series metrics into a specialized database.

---

## 📌 Table of Contents

- [Responsibility](#-responsibility)
- [Architecture & Data Sink](#-architecture--data-sink)
- [Standalone Local Development](#-standalone-local-development)
- [Environment Variables](#-environment-variables)

---

## 🎯 Responsibility

- **RabbitMQ Consumer:** Listens to the high-frequency telemetry queue (`iot_telemetry_queue`) using the Event-Pattern mechanism (`telemetry.created`).
- **Reliability (Ack/Nack):** Implements manual message acknowledgment (`noAck: false`) to ensure zero data loss during ingestion.
- **InfluxDB Integration:** Uses the official `@influxdata/influxdb-client` to ingest data points with nanosecond precision.
- **Performance Optimization:** Leverages the InfluxDB client's built-in **Batching** mechanism (buffering points in memory and flushing them in groups) to handle heavy IoT data loads efficiently without hammering the database.
- **Data Querying (Analytics):** Exposes gRPC endpoints to fetch historical telemetry aggregated by time ranges for frontend chart rendering.

---

## 📐 Architecture & Data Sink

- **Ingestion Pipeline:**
  `iot-broker-service` ➔ RabbitMQ (`telemetry.created`) ➔ `CollectorController` ➔ `InfluxDbService` (Batch Buffer) ➔ **InfluxDB v2**.
- **Data Modeling:**
  Metrics are stored as time-series points in a `device_metrics` measurement, utilizing **Tags** (`deviceId`, `metric`) for lightning-fast indexing and **Fields** (`value`) for numerical data.

---

## ⚙️ Standalone Local Development

How to run the statistics service locally:

1. **Install dependencies (from root workspace):**

   ```bash
   pnpm install
   ```

   **Ensure InfluxDB and RabbitMQ are running:**

   ```bash
   docker compose up -d influxdb rabbitmq-broker
   ```

   **Run service in watch mode:**

   ```bash
   pnpm dev --filter=statistics-service
   ```

## 🔑 Environment Variables

## 🔑 Environment Variables

| Variable                 | Default                           | Description                                   |
| ------------------------ | --------------------------------- | --------------------------------------------- |
| RABBITMQ_USER            | admin                             | Username for RabbitMQ connection              |
| RABBITMQ_PASSWORD        | secret_password                   | Password for RabbitMQ connection              |
| RABBITMQ_HOST            | rabbitmq-broker                   | Hostname for RabbitMQ broker                  |
| RABBITMQ_HOST_PORT       | 5672                              | Port for RabbitMQ connection                  |
| RABBITMQ_VHOST           | —                                 | Virtual host for RabbitMQ                     |
| RABBITMQ_EVENTS_QUEUE    | iot_events_queue                  | Queue name for IoT events                     |
| RABBITMQ_TELEMETRY_QUEUE | iot_telemetry_queue               | Queue name for IoT telemetry data             |
| RABBITMQ_STREAM_QUEUE    | gateway_stream_queue              | Queue name for IoT streaming data             |
| INFLUXDB_HOST_PORT       | 8086                              | Port for InfluxDB server                      |
| INFLUXDB_ADMIN_USER      | admin                             | Admin username for InfluxDB                   |
| INFLUXDB_ADMIN_PASSWORD  | my_secure_password_123            | Admin password for InfluxDB                   |
| INFLUXDB_ORG             | iot_home                          | Organization name for InfluxDB                |
| INFLUXDB_BUCKET          | telemetry                         | Bucket name for InfluxDB telemetry data       |
| INFLUXDB_ADMIN_TOKEN     | my-super-secret-token-for-diploma | Admin API token for InfluxDB                  |
| DEVICE_SERVICE_GRPC_URL  | device-service:50055              | gRPC address of the Device Management service |
