FROM node:22-alpine AS base
WORKDIR /app
RUN corepack enable

FROM base AS deps
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY client/package.json ./client/package.json
COPY server/package.json ./server/package.json
RUN pnpm install --frozen-lockfile

FROM base AS build
ARG NEXT_PUBLIC_API_URL=http://localhost:5000/api
ARG NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
ARG NEXT_PUBLIC_SERVER_URL=http://localhost:5000
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_SOCKET_URL=$NEXT_PUBLIC_SOCKET_URL
ENV NEXT_PUBLIC_SERVER_URL=$NEXT_PUBLIC_SERVER_URL
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/client/node_modules ./client/node_modules
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY client ./client
COPY server/package.json ./server/package.json
WORKDIR /app/client
RUN pnpm build

FROM node:22-alpine AS runtime
WORKDIR /app
RUN corepack enable
ENV NODE_ENV=production
ENV PORT=3000

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/client/node_modules ./client/node_modules
COPY --from=build /app/client/.next ./client/.next
COPY --from=build /app/client/public ./client/public
COPY --from=build /app/client/package.json ./client/package.json
COPY --from=build /app/client/next.config.js ./client/next.config.js

WORKDIR /app/client
EXPOSE 3000
CMD ["pnpm", "start"]
