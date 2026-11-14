# Device Management Service 🔌

Core microservice responsible for managing IoT devices, device groupings, and dynamic hardware profiles (drivers) with rich metadata mapping.

---

## 📌 Table of Contents

- [Responsibility](#-responsibility)
- [API Contracts (gRPC)](#-api-contracts-grpc)
- [Database & Schema](#-database--schema)
- [Standalone Local Development](#-standalone-local-development)
- [Environment Variables](#-environment-variables)

---

## 🎯 Responsibility

- Manages CRUD operations for IoT devices, binding them to users and groups.
- Stores protocol-specific connection configurations safely using PostgreSQL **JSONB** fields (supporting MQTT, Zigbee, Tuya, etc.).
- Manages **Device Profiles** — a metadata-driven database that defines telemetry mappings (`mappings`) and control capabilities (`commands`) for thousands of hardware models (sourced from `zigbee-herdsman-converters`).
- Acts as a gRPC provider, supplying device registries and profiles to the API Gateway and `iot-broker-service`.

---

## 🔌 API Contracts (gRPC)

This service exposes a gRPC server defined in [`packages/proto/device.proto`](../../packages/proto).

**Primary gRPC Methods:**

- `CreateDevice` — Registers a new device and emits a `device.created` event to RabbitMQ.
- `ListDevices` — Returns a paginated/full list of registered devices (used for broker cold-start synchronization).
- `GetProfile` — Retrieves device schema definitions (mappings/commands) by profile ID.
- `SearchProfiles` — Filters and returns lightweight device profile summaries for UI auto-complete.

---

## 🗄 Database & Schema

- **Database:** PostgreSQL via TypeORM.
- **Key Entities:**
  - `Device`: Stores id, userId, groupId, name, protocol, externalId, and flexible `connectionConfig` (JSONB).
  - `DeviceProfile`: Stores hardware definitions, data parsing rules (`mappings`), and action rules (`commands`) as JSONB.

---

## ⚙️ Standalone Local Development

How to run this specific service locally for isolated debugging:

1. **Install dependencies (from root workspace):**

   ```bash
   pnpm install
   ```

   Start database dependency:

   ```Bash
   docker-compose up -d postgres
   ```

   Run service in watch mode:

   ```Bash
   pnpm --filter device-service run start:dev
   ```

## 🔑 Environment Variables

| Variable                 | Default             | Description                        |
| ------------------------ | ------------------- | ---------------------------------- |
| PORT                     | 50055               | gRPC server port                   |
| DB_HOST                  | postgres            | Hostname for PostgreSQL database   |
| DB_PORT                  | 5432                | Port for PostgreSQL database       |
| DB_NAME                  | iot_device_db       | Name of the PostgreSQL database    |
| DB_USER                  | postgres_user       | Username for PostgreSQL connection |
| DB_PASSWORD              | strongpassword1     | Password for PostgreSQL connection |
| POSTGRES_SSL             | —                   | SSL mode for PostgreSQL connection |
| RABBITMQ_USER            | admin               | Username for RabbitMQ connection   |
| RABBITMQ_PASSWORD        | secret_password     | Password for RabbitMQ connection   |
| RABBITMQ_HOST            | rabbitmq-broker     | Hostname for RabbitMQ broker       |
| RABBITMQ_HOST_PORT       | 5672                | Port for RabbitMQ connection       |
| RABBITMQ_VHOST           | —                   | Virtual host for RabbitMQ          |
| RABBITMQ_EVENTS_QUEUE    | iot_events_queue    | Queue name for IoT events          |
| RABBITMQ_TELEMETRY_QUEUE | iot_telemetry_queue | Queue name for IoT telemetry data  |
