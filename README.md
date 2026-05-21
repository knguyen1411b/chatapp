# Realtime Chat App

Production-style realtime chat application with modern UI, private/group conversations, media upload, and secure cookie-based authentication.

## Screenshots

### Login

![Login UI](./login.png)

### Chat Dashboard

![Chat UI](./chat.png)

## Stack

- Frontend: Next.js 16, React 19, Ant Design 6, Tailwind CSS 4, TanStack Query, Socket.IO Client
- Backend: Node.js, Express, Socket.IO, Prisma, Zod
- Database: PostgreSQL
- Auth: JWT access/refresh tokens in `httpOnly` cookies, refresh rotation, OAuth (Google/GitHub)
- Media & Mail: Cloudinary, Nodemailer
- Monorepo: pnpm workspace

## Key Features

- Register/login with email + password
- OAuth login (Google/GitHub)
- Forgot password via email link
- Private chat (no duplicate conversation)
- Group chat with member validation
- Realtime messaging with Socket.IO rooms
- Presence (`online`, `away`, `offline`) and typing indicator
- Message actions: reply, forward, react, favorite, edit, delete
- Upload and send image/file in chat
- Unread count, mark-as-read, message pagination (infinite scroll)
- Responsive glass-style chat UI

## Architecture

```txt
chatapp/
  client/               # Next.js frontend
  server/               # Express + Socket.IO + Prisma backend
  docker-compose.yml    # Full local stack: client + server + postgres
```

## Quick Start (Local)

### 1) Install dependencies

```bash
pnpm install
```

### 2) Setup environment files

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env.local
```

### 3) Run Prisma generate + migration

```bash
pnpm prisma:generate
pnpm migrate
```

### 4) Start both apps

```bash
pnpm dev
```

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:5000`
- API base: `http://localhost:5000/api`

> [!IMPORTANT]
> Do not commit real `.env` files. Keep secrets only in local/private environment.

## Docker Run

Run full stack (client + server + postgres):

```bash
docker compose up -d --build
```

Stop:

```bash
docker compose down
```

Remove DB volume:

```bash
docker compose down -v
```

## Environment Variables

### `server/.env`

```env
DATABASE_URL="postgresql://postgres:a112233@localhost:5432/testdb?schema=public"
JWT_SECRET="your_super_secret_key"
PORT=5000
CLIENT_URL="http://localhost:3000"
SERVER_URL="http://localhost:5000"

GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""

CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""
CLOUDINARY_FOLDER="chatapp"

MAIL_USER=""
MAIL_PASS=""
```

### `client/.env.local`

```env
NEXT_PUBLIC_API_URL="http://localhost:5000/api"
NEXT_PUBLIC_SOCKET_URL="http://localhost:5000"
NEXT_PUBLIC_SERVER_URL="http://localhost:5000"
```

## Root Scripts

- `pnpm dev` run client + server in parallel
- `pnpm build` build both apps
- `pnpm lint` frontend lint + backend type-check
- `pnpm format` run Prettier
- `pnpm format:check` check formatting
- `pnpm prisma:generate` generate Prisma client
- `pnpm migrate` run Prisma migration

## API Overview

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `POST /api/auth/forgot-password`
- `GET /api/auth/reset-password/verify`
- `POST /api/auth/reset-password`
- `GET /api/users/search?query=...`
- `POST /api/conversations/private`
- `POST /api/conversations/group`
- `GET /api/conversations/my`
- `POST /api/conversations/:id/read`
- `GET /api/conversations/:id/messages`
- `POST /api/messages`
- `POST /api/upload`

## Stable Chat Flow

1. Login/register success
2. Open `/chat` in empty state (no auto-created conversation)
3. Search user or create group
4. Open/create valid conversation
5. Load paginated history
6. Send/receive realtime messages in conversation rooms only
