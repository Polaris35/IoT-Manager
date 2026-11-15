# IoT Manager Web UI 🖥️

The user-facing frontend application for the IoT management platform. Built with a modern, reactive tech stack, it provides real-time device monitoring, dynamic configuration wizards, and telemetry visualization.

---

## 📌 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture & State Management](#-architecture--state-management)
- [Standalone Local Development](#-standalone-local-development)
- [Environment Variables](#-environment-variables)

---

## 🚀 Features

- **Real-Time Dashboard:** Displays live device statuses, telemetry (temperature, voltage, battery, etc.), and connection health indicators instantly without page refreshes.
- **Dynamic Device Provisioning (Wizard):** A smart creation modal that interacts with backend device profiles to dynamically adapt configuration fields based on the selected protocol (MQTT vs. Zigbee).
- **Device Control:** Instant command dispatching (Toggle, Brightness, etc.) with optimistic UI updates and backend feedback loops.
- **Secure Authentication:** Protected routes with JWT-based session handling stored securely.

---

## 🛠 Tech Stack

- **Framework & Build Tool:** React, TypeScript, Vite
- **UI Library & Styling:** Material UI (MUI), Tailwind CSS, Material Icons
- **State Management:** Zustand (for global reactive state like SSE stream events)
- **Data Fetching & Caching:** TanStack Query (React Query) combined with **Orval** (auto-generated strongly-typed API clients and Zod validation schemas from backend Swagger specs)
- **Real-Time Communication:** Native `EventSource` (Server-Sent Events) multiplexed over a single HTTP connection

---

## 📐 Architecture & State Management

The frontend separates static data from real-time streams using a dual-layer approach:

1. **Static/CRUD Layer (React Query):** Handles device fetching, profile loading, and command mutations. Profiles are heavily cached (long-term caching) to minimize unnecessary network traffic.
2. **Real-Time Layer (Zustand + SSE):** A global `useGlobalStream` store maintains a single, persistent SSE connection (`/api/stream/events`). When telemetry arrives from the backend, it updates only the relevant device in the store, triggering ultra-targeted re-renders of individual UI cards via the `withLiveMetrics` HOC.

---

## ⚙️ Standalone Local Development

How to run the frontend application locally:

1. **Install dependencies (from root workspace):**

   ```bash
   pnpm install
   ```

2. **Set up environment variables:**

   ```bash
   cp .env.example .env
   ```

3. **Run the development server:**

   ```bash
   pnpm dev --filter=web
   ```

**(The app will typically be available at http://localhost:5173)**

---

## 🔑 Environment Variables

| Variable              | Default                   | Description                                 |
| --------------------- | ------------------------- | ------------------------------------------- |
| VITE_GOOGLE_CLIENT_ID | -                         | Google OAuth Client ID                      |
| VITE_API_URL          | http://localhost:3000/api | Base URL for the API Gateway REST endpoints |
