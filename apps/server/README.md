# API Gateway (BFF) 🚪

The single entry point and Backend-For-Frontend (BFF) for the IoT platform. It handles external HTTP/REST traffic, authenticates requests, routes synchronous calls to internal microservices via gRPC, and bridges real-time events to the frontend using Server-Sent Events (SSE).

---

## 📌 Table of Contents

- [Responsibility](#-responsibility)
- [Architecture & Routing](#-architecture--routing)
- [Standalone Local Development](#-standalone-local-development)
- [Environment Variables](#-environment-variables)

---

## 🎯 Responsibility

- **REST API:** Exposes clean, documented endpoints for the React frontend (decorated with Swagger/OpenAPI).
- **Request Validation:** Validates all incoming payloads using `class-validator`, `class-transformer`, and DTOs.
- **Authentication & Authorization:** Intercepts requests, validates JWT tokens (interacting with `auth-service`), and passes user context downstream.
- **gRPC Client Proxy:** Acts as a gRPC client, securely forwarding synchronous requests (such as device CRUD, profile searches, and user actions) to internal microservices.
- **Real-Time Multiplexing:** Acts as a hybrid app (HTTP + RabbitMQ consumer), listening to live system events and streaming them to the browser via **Server-Sent Events (SSE)** using reactive programming (RxJS).

---

## 📐 Architecture & Routing

- **Sync Traffic (REST ➔ gRPC):**
  Client requests (`POST /devices`, `GET /profiles`) hit the Gateway controllers, get validated, and are proxied to internal NestJS microservices over gRPC channels.
- **Async Traffic (RabbitMQ ➔ SSE):**
  The Gateway runs a built-in RabbitMQ microservice consumer that listens to internal event buses (`gateway_stream_queue`). Using RxJS `Subject` and `merge()`, it multiplexes different event types (`metrics`, `notifications`) into a single persistent SSE stream (`GET /stream/events`) for the client.

---

## ⚙️ Standalone Local Development

How to run the API Gateway locally:

1. **Install dependencies (from root workspace):**

   ```bash
   pnpm install
   ```

2. **Set up environment variables:**

   ```bash
   cp .env.example .env
   cp ./apps/server/.env.example ./apps/server/.env
   ```

3. **Ensure infrastructure dependencies are running (RabbitMQ, Postgres, etc.):**

   ```Bash
   docker compose up -d auth-service device-dervice iot-broker-service statistics-service
   ```

4. **Run service in watch mode:**

   ```Bash
   pnpm dev --filter=server
   ```

**(Swagger UI will be available at http://localhost:3000/api/swagger)**

---

## 🔑 Environment Variables

| Variable                 | Default              | Description                                   |
| ------------------------ | -------------------- | --------------------------------------------- |
| PORT                     | 3000                 | HTTP Server port                              |
| RABBITMQ_USER            | admin                | Username for RabbitMQ connection              |
| RABBITMQ_PASSWORD        | secret_password      | Password for RabbitMQ connection              |
| RABBITMQ_HOST            | rabbitmq-broker      | Hostname for RabbitMQ broker                  |
| RABBITMQ_HOST_PORT       | 5672                 | Port for RabbitMQ connection                  |
| RABBITMQ_VHOST           | —                    | Virtual host for RabbitMQ                     |
| RABBITMQ_EVENTS_QUEUE    | iot_events_queue     | Queue name for IoT events                     |
| RABBITMQ_TELEMETRY_QUEUE | iot_telemetry_queue  | Queue name for IoT telemetry data             |
| RABBITMQ_STREAM_QUEUE    | gateway_stream_queue | Queue name for IoT streaming data             |
| AUTH_SERVICE_URL         | auth-service:50051   | gRPC address of the Auth Service              |
| DEVICE_SERVICE_GRPC_URL  | device-service:50055 | gRPC address of the Device Management service |
