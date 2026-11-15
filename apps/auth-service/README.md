# Auth Service 🔐

Handles user authentication, registration, JWT token generation/validation, and secure session caching.

---

## 📌 Table of Contents

- [Responsibility](#responsibility-)
- [API Contracts (gRPC)](#-api-contracts-grpc)
- [Database & Caching](#-database--caching)
- [Standalone Local Development](#-standalone-local-development)
- [Environment Variables](#-environment-variables)

---

## Responsibility 🎯

- Handles secure user registration (password hashing via bcrypt) and credential validation.
- Generates and verifies JWT (JSON Web Tokens) for system-wide authorization.
- Caches and manages active user sessions/tokens in **Redis**.
- Communicates exclusively via **gRPC** with the API Gateway and internal microservices.

---

## 🔌 API Contracts (gRPC)

This service exposes a gRPC server defined in [`packages/proto/auth.proto`](../../packages/proto).

**Primary gRPC Methods:**

- `Login` — Authenticates credentials and returns a signed JWT.
- `Register` — Creates a new user account and hashes the password.
- `ValidateToken` — Verifies the authenticity and expiration of a JWT for incoming API Gateway requests.

---

## 🗄 Database & Caching

- **Database:** PostgreSQL via TypeORM.
- **Cache:** Redis for token validation caching and session management.

---

## ⚙️ Standalone Local Development

How to run this specific service locally for isolated debugging (without launching the whole stack):

1. **Install dependencies (from root workspace):**

   ```bash
   pnpm install
   ```

2. **Set up environment variables:**

   ```bash
   cp .env.example .env
   cp ./apps/auth-service/.env.example ./apps/auth-service/.env
   ```

3. **Start dependencies (Postgres & Redis via Docker):**

   ```Bash
   docker compose up -d postgres redis
   ```

4. **Run service in watch mode:**

   ```Bash
   pnpm dev --filter=auth-service
   ```

---

## 🔑 Environment Variables

| Variable             | Default                | Description                               |
| -------------------- | ---------------------- | ----------------------------------------- |
| PORT                 | 50051                  | gRPC server port                          |
| DB_HOST              | postgres               | Hostname for PostgreSQL database          |
| DB_PORT              | 5432                   | Port for PostgreSQL database              |
| DB_NAME              | iot_auth_db            | Name of the PostgreSQL database           |
| DB_USER              | postgres_user          | Username for PostgreSQL connection        |
| DB_PASSWORD          | strongpassword1        | Password for PostgreSQL connection        |
| POSTGRES_SSL         | —                      | SSL mode for PostgreSQL connection        |
| JWT_SECRET           | super_secret           | Secret key used to sign JWT tokens        |
| GOOGLE_CLIENT_ID     | —                      | Google OAuth Client ID                    |
| GOOGLE_CLIENT_SECRET | —                      | Google OAuth Client Secret                |
| REDIS_URL            | redis://localhost:6379 | Connection string for Redis session cache |

```

```
