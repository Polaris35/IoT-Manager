# 1. Base stage
FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN mkdir -p "$PNPM_HOME" && chown -R root:root "$PNPM_HOME"
RUN npm i -g pnpm

# 2. Pruner stage
FROM base AS pruner
WORKDIR /app
RUN npm i -g turbo
COPY turbo.json package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps ./apps
COPY packages ./packages
RUN turbo prune web --docker

# 3. Builder stage
FROM base AS builder
WORKDIR /app
COPY --from=pruner /app/out/full/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml

RUN pnpm install --frozen-lockfile
RUN npm i -g turbo

# Собираем React Router v7 (создаст папку /app/apps/web/build)
RUN turbo build --filter=web

# 4. Production installer
FROM base AS prod_installer
WORKDIR /app
COPY --from=pruner /app/out/full/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml

RUN pnpm install --prod --frozen-lockfile
# 5. Final Runner stage (Node.js сервер)
FROM base AS runner
WORKDIR /app

# Создаем пользователя для безопасности
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nestjs

# Копируем зависимости
COPY --from=prod_installer --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=prod_installer --chown=nestjs:nodejs /app/apps/web/node_modules ./apps/web/node_modules

# Копируем собранный билдером результат (папка build) и package.json
COPY --from=builder --chown=nestjs:nodejs /app/apps/web/build ./apps/web/build
COPY --from=pruner --chown=nestjs:nodejs /app/out/full/apps/web/package.json ./apps/web/package.json
COPY --from=pruner --chown=nestjs:nodejs /app/out/full/package.json ./package.json

# Настраиваем права
RUN chown -R nestjs:nodejs /app && chown -R nestjs:nodejs /pnpm

USER nestjs

# Переходим в рабочую директорию веб-приложения
WORKDIR /app/apps/web

# Указываем порт для React Router (по умолчанию 3000)
ENV PORT=3000
EXPOSE 3000

# Запускаем штатный сервер React Router
CMD ["pnpm", "start"]
