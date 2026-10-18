# 1 base image with Node.js and pnpm
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
RUN turbo prune auth-service --docker

# 3. ASSEMBLY Stage
FROM base AS builder
WORKDIR /app

# Copying a trimmed version of the monorepo from pruner
COPY --from=pruner /app/out/full/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml

RUN pnpm install

RUN npm i -g turbo

RUN turbo build --filter=auth-service

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
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nestjs

COPY --from=prod_installer --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=prod_installer --chown=nestjs:nodejs /app/apps/auth-service/node_modules ./apps/auth-service/node_modules
COPY --from=builder --chown=nestjs:nodejs /app/apps/auth-service/dist ./apps/auth-service/dist
COPY --from=builder --chown=nestjs:nodejs /app/packages ./packages
COPY --from=pruner --chown=nestjs:nodejs /app/out/full/apps/auth-service/package.json ./apps/auth-service/package.json
COPY --from=pruner --chown=nestjs:nodejs /app/out/full/package.json ./package.json

RUN chown -R nestjs:nodejs /app && chown -R nestjs:nodejs /pnpm

USER nestjs

WORKDIR /app/apps/auth-service
# --- Starting application ---
CMD ["pnpm", "--filter=auth-service", "start:prod"]
