FROM node:22-alpine AS base
WORKDIR /app
RUN corepack enable

FROM base AS deps
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY server/package.json ./server/package.json
COPY client/package.json ./client/package.json
RUN pnpm install --frozen-lockfile

FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/server/node_modules ./server/node_modules
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY server ./server
COPY client/package.json ./client/package.json
WORKDIR /app/server
RUN pnpm prisma:generate
RUN pnpm build

FROM node:22-alpine AS runtime
WORKDIR /app
RUN corepack enable
ENV NODE_ENV=production

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/server/node_modules ./server/node_modules
COPY --from=build /app/server/dist ./server/dist
COPY --from=build /app/server/prisma ./server/prisma
COPY --from=build /app/server/package.json ./server/package.json
COPY --from=build /app/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=build /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=build /app/package.json ./package.json

WORKDIR /app/server
EXPOSE 5000
CMD ["sh", "-c", "pnpm exec prisma migrate deploy || true; node dist/index.js"]
