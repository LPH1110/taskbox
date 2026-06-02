# Supabase → Custom Backend Migration

## Goal

Migrate Taskbox from Supabase BaaS to a self-hosted **Node.js + Express + PostgreSQL** backend, containerized with **Podman Compose**, preserving all existing functionality: auth (email/password + Google OAuth), CRUD for 7 tables, and realtime board updates via WebSocket.

---

## Decisions (Confirmed)

| Aspect | Choice | Rationale |
|--------|--------|-----------|
| **Database** | PostgreSQL 16 | Schema already designed around PG idioms (UUIDs, upsert, relational joins). Zero data model changes. |
| **ORM** | Prisma | User's familiarity + auto-generated types + migration system |
| **API Style** | REST (Express) | Simple CRUD operations, single SPA consumer |
| **Realtime** | Socket.IO | Bi-directional needed for drag-drop sync across clients |
| **Auth** | JWT + Passport.js (Google OAuth) | Replace Supabase Auth, keep Google login |
| **Containerization** | Podman Compose | PostgreSQL + Express API in containers, bash rebuild script |

---

## Current Supabase Surface (Audit)

| Feature | Files Affected | Tables/Services |
|---------|---------------|-----------------|
| Auth (signIn, signUp, signOut, OAuth, getSession) | `authSlice.ts`, `login-form.tsx`, `register-form.tsx`, `App.tsx` | `auth.users`, `profiles` |
| Database CRUD | `boardsSlice.ts`, `boardDetailSlide.ts`, `move-column-dialog.tsx` | `boards`, `columns`, `tasks`, `labels`, `task_labels`, `board_members`, `profiles` |
| Realtime (postgres_changes) | `board-detail-page.tsx` | Subscriptions on 6 tables |
| Supabase Client | `lib/supabase.ts` | Client init |

---

## Tech Stack (Backend)

```
be/
├── prisma/
│   └── schema.prisma         # Database schema + migrations
├── src/
│   ├── index.ts               # Express + Socket.IO server entry
│   ├── config/
│   │   ├── env.ts             # Environment variable validation (Zod)
│   │   ├── passport.ts        # Google OAuth + JWT strategy config
│   │   └── socket.ts          # Socket.IO initialization
│   ├── middleware/
│   │   ├── auth.ts            # JWT verification middleware
│   │   ├── error-handler.ts   # Centralized error handler
│   │   └── validate.ts        # Zod request validation middleware
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   └── auth.schema.ts    # Zod schemas for login/register
│   │   ├── boards/
│   │   │   ├── boards.controller.ts
│   │   │   ├── boards.service.ts
│   │   │   └── boards.schema.ts
│   │   ├── columns/
│   │   │   ├── columns.controller.ts
│   │   │   ├── columns.service.ts
│   │   │   └── columns.schema.ts
│   │   ├── tasks/
│   │   │   ├── tasks.controller.ts
│   │   │   ├── tasks.service.ts
│   │   │   └── tasks.schema.ts
│   │   ├── labels/
│   │   │   ├── labels.controller.ts
│   │   │   ├── labels.service.ts
│   │   │   └── labels.schema.ts
│   │   └── members/
│   │       ├── members.controller.ts
│   │       ├── members.service.ts
│   │       └── members.schema.ts
│   ├── lib/
│   │   ├── prisma.ts          # Prisma client singleton
│   │   └── socket-emitter.ts  # Helper to emit realtime events
│   └── utils/
│       ├── api-response.ts    # Consistent { success, data, error } format
│       └── jwt.ts             # Sign/verify JWT helpers
├── Dockerfile
├── package.json
├── tsconfig.json
└── .env.example
```

---

## API Endpoints

### Auth

| Method | Endpoint | Description | Replaces |
|--------|----------|-------------|----------|
| `POST` | `/api/auth/register` | Email/password signup + auto-create profile | `supabase.auth.signUp()` |
| `POST` | `/api/auth/login` | Email/password login → returns JWT | `supabase.auth.signInWithPassword()` |
| `POST` | `/api/auth/logout` | Invalidate token (client-side) | `supabase.auth.signOut()` |
| `GET`  | `/api/auth/me` | Get current user + profile from JWT | `supabase.auth.getSession()` + `profiles` query |
| `GET`  | `/api/auth/google` | Initiate Google OAuth flow | `supabase.auth.signInWithOAuth()` |
| `GET`  | `/api/auth/google/callback` | Google OAuth callback → returns JWT | Supabase handled internally |

### Boards

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/boards` | Fetch user's boards |
| `POST` | `/api/boards` | Create board |
| `PATCH` | `/api/boards/:id/favorite` | Toggle favorite |

### Columns

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/boards/:boardId/columns` | Create column |
| `PATCH` | `/api/columns/:id` | Update column title |
| `PATCH` | `/api/columns/:id/move` | Move column to different board |
| `POST` | `/api/columns/:id/copy` | Copy column + tasks |
| `DELETE` | `/api/columns/:id` | Delete column + cascade tasks |
| `PUT` | `/api/columns/reorder` | Batch upsert column positions |

### Tasks

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/columns/:columnId/tasks` | Create task |
| `PATCH` | `/api/tasks/:id` | Update task fields |
| `DELETE` | `/api/tasks/:id` | Delete task |
| `PUT` | `/api/tasks/reorder` | Batch upsert task positions |
| `POST` | `/api/tasks/move-all` | Move all tasks between columns |

### Labels

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/boards/:boardId/labels` | Create label |
| `PATCH` | `/api/labels/:id` | Update label |
| `DELETE` | `/api/labels/:id` | Delete label |
| `POST` | `/api/tasks/:taskId/labels/:labelId` | Attach label to task |
| `DELETE` | `/api/tasks/:taskId/labels/:labelId` | Detach label from task |

### Members

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/boards/:boardId/members` | Add member by email |
| `DELETE` | `/api/boards/:boardId/members/:userId` | Remove member |

### Board Detail (Composite)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/boards/:boardId/detail` | Fetch board + columns + tasks + labels + members + taskLabels (single call) |

---

## Socket.IO Events (Replacing Supabase Realtime)

### Server → Client Events

| Event | Payload | Triggered By |
|-------|---------|-------------|
| `board:update` | `Partial<Board>` | Board mutation |
| `column:upsert` | `Column` | Column create/update |
| `column:delete` | `{ id: string }` | Column delete |
| `task:upsert` | `Task` | Task create/update/reorder |
| `task:delete` | `{ id: string, column_id: string }` | Task delete |
| `label:upsert` | `Label` | Label create/update |
| `label:delete` | `{ id: string }` | Label delete |
| `taskLabel:event` | `{ task_id, label_id, type: 'INSERT' \| 'DELETE' }` | Label toggle |
| `member:event` | `{ member: BoardMember, type: 'INSERT' \| 'DELETE' }` | Member add/remove |

### Client → Server

| Event | Purpose |
|-------|---------|
| `join:board` | Join Socket.IO room `board:{boardId}` |
| `leave:board` | Leave room |

### Server Emit Pattern

```typescript
// In every service method that mutates data:
socketEmitter.toBoardRoom(boardId, 'task:upsert', createdTask);
```

---

## Prisma Schema (Equivalent to Supabase Tables)

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model Profile {
  id         String   @id @default(uuid())
  email      String   @unique
  password   String?                      // null for OAuth users
  full_name  String?
  avatar_url String?
  provider   String   @default("email")   // "email" | "google"
  created_at DateTime @default(now())

  boards       Board[]
  memberships  BoardMember[]

  @@map("profiles")
}

model Board {
  id               String   @id @default(uuid())
  title            String
  type             String   @default("private")
  background_image String?
  is_favorite      Boolean  @default(false)
  owner_id         String
  created_at       DateTime @default(now())

  owner    Profile       @relation(fields: [owner_id], references: [id])
  columns  Column[]
  labels   Label[]
  members  BoardMember[]
  tasks    Task[]

  @@map("boards")
}

model Column {
  id       String @id @default(uuid())
  board_id String
  title    String
  position Int    @default(0)

  board Board  @relation(fields: [board_id], references: [id], onDelete: Cascade)
  tasks Task[]

  @@map("columns")
}

model Task {
  id          String  @id @default(uuid())
  content     String
  description String?
  column_id   String
  board_id    String
  priority    String?
  position    Int     @default(0)

  column     Column      @relation(fields: [column_id], references: [id], onDelete: Cascade)
  board      Board       @relation(fields: [board_id], references: [id], onDelete: Cascade)
  taskLabels TaskLabel[]

  @@map("tasks")
}

model Label {
  id       String @id @default(uuid())
  board_id String
  title    String
  color    String

  board      Board       @relation(fields: [board_id], references: [id], onDelete: Cascade)
  taskLabels TaskLabel[]

  @@map("labels")
}

model TaskLabel {
  task_id  String
  label_id String

  task  Task  @relation(fields: [task_id], references: [id], onDelete: Cascade)
  label Label @relation(fields: [label_id], references: [id], onDelete: Cascade)

  @@id([task_id, label_id])
  @@map("task_labels")
}

model BoardMember {
  board_id  String
  user_id   String
  role      String   @default("member")
  joined_at DateTime @default(now())

  board   Board   @relation(fields: [board_id], references: [id], onDelete: Cascade)
  profile Profile @relation(fields: [user_id], references: [id], onDelete: Cascade)

  @@id([board_id, user_id])
  @@map("board_members")
}
```

---

## Podman Compose

```yaml
# podman-compose.yml (project root)
version: "3.8"
services:
  db:
    image: postgres:16-alpine
    container_name: taskbox-db
    restart: unless-stopped
    environment:
      POSTGRES_USER: ${POSTGRES_USER:-taskbox}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-taskbox_secret}
      POSTGRES_DB: ${POSTGRES_DB:-taskbox}
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U taskbox"]
      interval: 5s
      timeout: 3s
      retries: 5

  api:
    build:
      context: ./be
      dockerfile: Dockerfile
    container_name: taskbox-api
    restart: unless-stopped
    depends_on:
      db:
        condition: service_healthy
    environment:
      DATABASE_URL: postgresql://${POSTGRES_USER:-taskbox}:${POSTGRES_PASSWORD:-taskbox_secret}@db:5432/${POSTGRES_DB:-taskbox}
      JWT_SECRET: ${JWT_SECRET}
      GOOGLE_CLIENT_ID: ${GOOGLE_CLIENT_ID}
      GOOGLE_CLIENT_SECRET: ${GOOGLE_CLIENT_SECRET}
      GOOGLE_CALLBACK_URL: ${GOOGLE_CALLBACK_URL:-http://localhost:3001/api/auth/google/callback}
      CLIENT_URL: ${CLIENT_URL:-http://localhost:5173}
      PORT: 3001
    ports:
      - "3001:3001"

volumes:
  pgdata:
```

---

## Rebuild Script

```bash
#!/usr/bin/env bash
# rebuild.sh (project root)
# Prune and rebuild all containers from scratch

set -euo pipefail

echo "🧹 Stopping and removing containers, volumes, and images..."
podman compose down --volumes --rmi all 2>/dev/null || true

echo "🧼 Pruning dangling resources..."
podman system prune -f

echo "🔨 Rebuilding from scratch..."
podman compose build --no-cache

echo "🚀 Starting services..."
podman compose up -d

echo "⏳ Waiting for database to be healthy..."
sleep 5

echo "📦 Running Prisma migrations..."
podman compose exec api npx prisma migrate deploy

echo "✅ All services are running!"
podman compose ps
```

---

## Frontend Changes (Summary)

### Files to DELETE
- `fe/src/lib/supabase.ts` → Replaced by `fe/src/lib/api.ts`

### Files to CREATE
- `fe/src/lib/api.ts` — Axios instance with JWT interceptor + `API_BASE_URL`
- `fe/src/lib/socket.ts` — Socket.IO client instance

### Files to REWRITE (Supabase → Axios)
| File | Changes |
|------|---------|
| `authSlice.ts` | All 5 thunks → Axios calls to `/api/auth/*`. Store JWT in localStorage. |
| `boardsSlice.ts` | 3 thunks → Axios calls to `/api/boards/*` |
| `boardDetailSlide.ts` | All 15+ thunks → Axios calls to respective REST endpoints |
| `move-column-dialog.tsx` | Direct `supabase.from("boards")` → Axios `GET /api/boards` |
| `board-detail-page.tsx` | Supabase Realtime channel → Socket.IO client (`socket.io-client`) |
| `App.tsx` | `checkAuthSession` → calls `GET /api/auth/me` with stored JWT |

### New FE Dependencies
```
npm install socket.io-client
npm uninstall @supabase/supabase-js
```

---

## Tasks

### Phase 1: Infrastructure

- [ ] **T1: Scaffold backend project** → `be/` with Express + TypeScript + Prisma. Run `npm init`, install deps (`express`, `prisma`, `@prisma/client`, `socket.io`, `passport`, `passport-google-oauth20`, `jsonwebtoken`, `bcryptjs`, `zod`, `cors`, `helmet`). Create `tsconfig.json`, `Dockerfile`, `.env.example`. → Verify: `npx tsc --noEmit` passes.

- [ ] **T2: Prisma schema + initial migration** → Write `schema.prisma` (schema above), run `npx prisma migrate dev --name init`. → Verify: `npx prisma studio` shows 7 empty tables.

- [ ] **T3: Podman Compose + rebuild script** → Create `podman-compose.yml` and `rebuild.sh` in project root. → Verify: `bash rebuild.sh` starts both containers, `podman compose ps` shows both healthy.

### Phase 2: Auth Module

- [ ] **T4: Auth service + controller** → Implement `register`, `login`, `me`, `logout` endpoints with bcrypt password hashing, JWT signing, Zod validation. Implement Passport Google OAuth strategy with `GET /api/auth/google` + callback. → Verify: `curl -X POST localhost:3001/api/auth/register -d '{"email":"test@test.com","password":"123456","fullName":"Test"}' -H 'Content-Type: application/json'` returns JWT.

### Phase 3: CRUD Modules

- [ ] **T5: Board + Column + Task + Label + Member services** → Implement all REST endpoints (see API table above). Each service method emits Socket.IO events after mutation. Use layered architecture (Controller → Service → Prisma). → Verify: All endpoints return correct responses via Postman/curl.

- [ ] **T6: Socket.IO integration** → Configure Socket.IO server, implement `join:board` / `leave:board` rooms, wire all service mutations to emit events to `board:{boardId}` room. → Verify: Connect two Socket.IO clients to same room, mutation on one triggers event on other.

### Phase 4: Frontend Migration

- [ ] **T7: Create `fe/src/lib/api.ts` + `fe/src/lib/socket.ts`** → Axios instance with `baseURL`, JWT interceptor (auto-attach `Authorization: Bearer` header), response/error interceptor. Socket.IO client instance. → Verify: Import works, requests include token.

- [ ] **T8: Rewrite Redux slices** → Rewrite `authSlice.ts`, `boardsSlice.ts`, `boardDetailSlide.ts` to use Axios instead of Supabase. Rewrite `move-column-dialog.tsx` inline query. Remove `@supabase/supabase-js` dependency. → Verify: `npm run build` passes with zero Supabase imports remaining.

- [ ] **T9: Replace Supabase Realtime with Socket.IO** → In `board-detail-page.tsx`, replace the Supabase channel subscription with `socket.io-client`. Connect on mount, join board room, listen for events, dispatch existing Redux actions. → Verify: Open two browser tabs, creating a task in one shows in the other.

### Phase 5: Verification

- [ ] **T10: Full integration test** → Run `bash rebuild.sh`, start frontend with `npm run dev`, register user, create board, add columns/tasks, drag-drop reorder, verify realtime sync in two tabs, test Google OAuth flow. → Verify: All features work end-to-end.

---

## Done When

- [ ] `bash rebuild.sh` starts PostgreSQL + API containers successfully
- [ ] Auth (register/login/Google OAuth) works end-to-end
- [ ] All board CRUD operations work through the custom API
- [ ] Realtime updates work via Socket.IO across multiple browser tabs
- [ ] Zero Supabase references remain in the codebase
- [ ] `npm run build` passes on the frontend

---

## Notes

- **JWT Storage**: Store in `localStorage` for simplicity. Upgrade to `httpOnly` cookies later if needed.
- **RLS Replacement**: Supabase RLS is replaced by Express auth middleware + service-level authorization checks (verify `owner_id` or `board_members` membership).
- **Migration Data**: Since Supabase was shutdown, no data migration needed — fresh start.
- **Google OAuth**: User will configure Google Cloud Console credentials. Backend needs `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` env vars.
- **CORS**: API must allow `http://localhost:5173` (Vite dev server) in CORS config.
