# 1. base image with Node.js and pnpm
FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN mkdir -p "$PNPM_HOME" && chown -R root:root "$PNPM_HOME"
RUN npm i -g pnpm

# 2 Stage "pruner" for "trimming" monorepo
FROM base AS pruner
WORKDIR /app
RUN npm i -g turbo
# Copying only the files needed for dependencies analisis
COPY turbo.json package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps ./apps
COPY packages ./packages
# Run prune. It will create an 'out' folder with everything you need (including the source files).
RUN turbo prune device-service --docker

# 3. ASSEMBLY STAGE
FROM base AS builder
WORKDIR /app


# Copying a trimmed version of the monorepo from pruner
COPY --from=pruner /app/out/full/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml

RUN pnpm install

RUN npm i -g turbo

RUN turbo build --filter=device-service

# 4. Stage for installing ONLY production dependencies
FROM base AS prod_installer
WORKDIR /app
# Copying trimmed of the monorepo from pruner
COPY --from=pruner /app/out/full/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml

RUN pnpm install --prod

# 5. The final, lightweight image
FROM base AS runner
WORKDIR /app

# Copying trimmed of the monorepo from pruner
COPY --from=pruner /app/out/full/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml

RUN pnpm install --prod

# Copy ONLY the compiled code from the 'builder' stage
COPY --from=builder /app/apps/device-service/dist /app/apps/device-service/dist
COPY --from=builder /app/packages/proto/dist /app/packages/proto/dist
COPY --from=builder /app/packages/nest-libs/dist /app/packages/nest-libs/dist

# --- Security settings ---
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs
RUN chown -R nestjs:nodejs /app
USER nestjs

# --- Starting application ---
CMD ["pnpm", "--filter=device-service", "start:prod"]