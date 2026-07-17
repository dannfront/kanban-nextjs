# Design: Fase 1 — Backend Schema (PostgreSQL + Prisma + Docker)

## Technical Approach

Stand up PostgreSQL in Docker, declare the domain in Prisma v7, generate the first migration, and seed a dummy OWNER user + 3 boards / 9 columns / 22 tasks (with subtasks) from `data.json`. The frontend keeps reading `data.json` + Zustand — no wiring change in this phase. Per the project rule, the Prisma client lives in `src/lib/prisma.ts` and is consumed by the seed and a smoke script only (no Server Actions yet).

## Architecture Decisions

| # | Decision | Choice | Tradeoff | Rationale |
|---|----------|--------|----------|-----------|
| D1 | Postgres image | `postgres:latest` per proposal | Moving target | Proposal fixed; revisit if reproducibility bites (risk tracked). |
| D2 | Compose layout | One service, named volume `pgdata`, port `5432:5432`, healthcheck via `pg_isready -U $POSTGRES_USER` | Simple | Standard dev pattern; healthcheck gates `prisma migrate`. |
| D3 | Single-owner representation | `BoardMember.role = OWNER` (no `Board.ownerId`) | Invariant: ≥1 OWNER per board | Proposal settled; OWNER is a membership, not a property. Multi-owner boards come free later. Enforced at app level in auth phase. |
| D4 | `Task.status` field | Dropped; derived from `column.name` | Join needed in status views | Proposal settled. Seed ignores `status` from `data.json`. |
| D5 | IDs | `String @id @default(uuid())` for every model | Larger than int | Cross-system stability, no ordinal leakage. |
| D6 | Soft delete | `deletedAt DateTime?` on Board, Column, Task, Subtask | Always `where: { deletedAt: null }` | Proposal settled; never filter by hand again. |
| D7 | Order fields | `Int` (fractional-index contract; rebalance deferred) | Needs rebalance logic later | Current data fits in 0..N integer gaps. |
| D8 | Indexes | `@@index([boardId, order])` on Column, `@@index([columnId, order])` on Task, `@@index([taskId])` on Subtask | Disk vs. query speed | Board view is the hot path; order lookups must stay fast. |
| D9 | Cascade strategy | `onDelete: Cascade` on all FKs | Hard delete at DB level | Soft delete is the app contract; cascade makes the *hard* delete (rare, admin) safe at the DB. |
| D10 | Seed ordering | user → boards → boardMembers → columns → tasks → subtasks, in `prisma.$transaction` | One round-trip; atomic | Matches FK dependency graph. Wipe in reverse. |
| D11 | Idempotency | Wipe-and-reinsert on every `prisma db seed` | Destructive in dev | Proposal settled. Dev-only; never in prod. |
| D12 | Client singleton | `globalThis.prisma` cache in non-prod (HMR-safe) | One global in dev | Standard Prisma + Next pattern; prevents connection-pool exhaustion on hot reload. |
| D13 | Seed runner | `bunx tsx prisma/seed.ts` | Two layers | Proposal settled; `bunx` for repo consistency, `tsx` is universal. |
| D14 | Seed file casing | `prisma/seed.ts` (kebab-case, lowercase) | — | Project convention: new files kebab-case. |

## Data Flow

```
docker compose up -d            # postgres:latest, port 5432, vol pgdata
        │  (waits for healthcheck: pg_isready)
        ▼
bunx prisma migrate dev --name init
        │  prisma/schema.prisma → prisma/migrations/{ts}_init/migration.sql
        ▼
bunx prisma db seed              # prisma/seed.ts (registered via package.json#prisma.seed)
        │  read data.json (sync)
        │  build oldId → newUuid maps (board, column, task)
        │  $transaction:
        │    deleteMany(Subtask, Task, Column, BoardMember, Board, User)
        │    create(User dummy) → createMany(Board × 3) → createMany(BoardMember × 3 OWNER)
        │    createMany(Column × 9, boardId from map)
        │    createMany(Task × 22, columnId from map)        # drop `status`
        │    createMany(Subtask × n, taskId from map)
        ▼
bunx prisma studio               # visual verify
bun run db:smoke                 # prisma.board.findMany().length === 3
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `docker-compose.yml` | Create | `postgres` service, `pgdata` named volume, `5432:5432`, healthcheck. |
| `prisma/schema.prisma` | Create | datasource + generator + `BoardRole` enum + 6 models. |
| `prisma/migrations/{ts}_init/migration.sql` | Create (by Prisma) | First DDL. Do not hand-edit. |
| `prisma/seed.ts` | Create | TS seed; `data.json` → DB. |
| `src/lib/prisma.ts` | Create | HMR-safe `PrismaClient` singleton. |
| `scripts/db-smoke.ts` | Create | One-shot `prisma.board.findMany()` + console.log; expects 3. |
| `.env` | Create | `DATABASE_URL` (gitignored). |
| `.env.example` | Create | Same shape with placeholders; committed. |
| `package.json` | Modify | Add `prisma` (dev) + `@prisma/client` (dep). Add `prisma.seed` config. Add scripts: `db:up`, `db:down`, `db:migrate`, `db:seed`, `db:reset`, `db:studio`, `db:smoke`, `prisma`. |
| `.gitignore` | Modify | Already ignores `.env*`; add `prisma/dev.db*` defensively. |
| `data.json` | Untouched | Still read by the frontend; seed reads the same file. |

## Interfaces / Contracts

```prisma
// prisma/schema.prisma — shape summary
datasource db { provider = "postgresql"; url = env("DATABASE_URL") }
generator client { provider = "prisma-client-js" }

enum BoardRole { OWNER EDITOR GUEST }

model User {
  id String @id @default(uuid())
  email String @unique
  name String
  password String                       // hashed by Auth.js in auth phase
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  memberships BoardMember[]
}
// Board, BoardMember, Column, Task, Subtask: see decisions D3, D4, D6, D8, D9.
// All models: id (uuid @default), createdAt, updatedAt.
// Board/Column/Task/Subtask: + deletedAt DateTime?.
// Column/Task: + order Int, boardId/columnId FK, @@index([parentId, order]).
// BoardMember: userId+boardId FKs, role BoardRole @default(EDITOR), @@unique([userId, boardId]).
// Subtask: title, isCompleted Boolean @default(false), taskId FK, @@index([taskId]).
// All FKs: onDelete: Cascade.
```

```ts
// src/lib/prisma.ts — HMR-safe singleton
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

## Seed Mapping Logic (`data.json` → UUIDs)

`data.json` ships readable mock ids (`"board-001"`, `"col-board-001-todo"`, `"task-col-board-001-todo-001"`, `"sub-task-..."`); the schema uses `uuid()`. The seed bridges them with three `Map<string,string>`s so every FK resolves after the round-trip:

```ts
// prisma/seed.ts (sketch — full file in apply)
import { PrismaClient, BoardRole } from "@prisma/client";
import data from "../data.json" with { type: "json" };

const prisma = new PrismaClient();
const boardIdMap  = new Map<string, string>(); // mock id -> uuid
const columnIdMap = new Map<string, string>();
const taskIdMap   = new Map<string, string>();

// Pre-insert asserts: data.boards.length===3, data.columns.length===9, data.tasks.length===22
// (drift between schema and data.json fails fast)

await prisma.$transaction(async (tx) => {
  // 1. wipe in reverse FK order
  await tx.subtask.deleteMany();
  await tx.task.deleteMany();
  await tx.column.deleteMany();
  await tx.boardMember.deleteMany();
  await tx.board.deleteMany();
  await tx.user.deleteMany();

  // 2. dummy OWNER user
  const user = await tx.user.create({
    data: { email: "owner@kanban.local", name: "Dev Owner", password: "TBD" },
  });

  // 3. boards + OWNER membership
  for (const b of data.boards) {
    const created = await tx.board.create({ data: { name: b.name, isActive: b.isActive } });
    boardIdMap.set(b.id, created.id);
    await tx.boardMember.create({
      data: { userId: user.id, boardId: created.id, role: BoardRole.OWNER },
    });
  }

  // 4. columns (order verbatim)
  for (const c of data.columns) {
    const created = await tx.column.create({
      data: { name: c.name, color: c.color, order: c.order, boardId: boardIdMap.get(c.boardId)! },
    });
    columnIdMap.set(c.id, created.id);
  }

  // 5. tasks (drop the deprecated `status` field)
  for (const t of data.tasks) {
    const created = await tx.task.create({
      data: { title: t.title, description: t.description ?? "", order: t.order, columnId: columnIdMap.get(t.columnId)! },
    });
    taskIdMap.set(t.id, created.id);
  }

  // 6. subtasks
  for (const t of data.tasks) {
    for (const s of t.subtasks) {
      await tx.subtask.create({
        data: { title: s.title, isCompleted: s.isCompleted, taskId: taskIdMap.get(t.id)! },
      });
    }
  }
});
```

Key invariants: (a) every `columnId` lookup is non-null (`!`) because the parent was just inserted in the same transaction; (b) `Task.status` is **not** persisted — derived from `column.name`; (c) `order` values are preserved verbatim.

## Configuration Details

**`docker-compose.yml`** (shape):
```yaml
services:
  postgres:
    image: postgres:latest
    container_name: kanban-postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: ${POSTGRES_USER:-kanban}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-kanban}
      POSTGRES_DB: ${POSTGRES_DB:-kanban}
    ports: ["5432:5432"]
    volumes: [pgdata:/var/lib/postgresql/data]
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U $${POSTGRES_USER} -d $${POSTGRES_DB}"]
      interval: 5s
      timeout: 3s
      retries: 10
volumes:
  pgdata:
```

**`.env.example`** (committed):
```
DATABASE_URL="postgresql://kanban:kanban@localhost:5432/kanban?schema=public"
POSTGRES_USER=kanban
POSTGRES_PASSWORD=kanban
POSTGRES_DB=kanban
```

**`package.json`** (additions):
```json
{
  "prisma": { "seed": "bunx tsx prisma/seed.ts" },
  "scripts": {
    "db:up":      "docker compose up -d",
    "db:down":    "docker compose down",
    "db:migrate": "bunx prisma migrate dev",
    "db:seed":    "bunx prisma db seed",
    "db:reset":   "bunx prisma migrate reset --force && bunx prisma db seed",
    "db:studio":  "bunx prisma studio",
    "db:smoke":   "bunx tsx scripts/db-smoke.ts",
    "prisma":     "bunx prisma"
  }
}
```

## Testing Strategy

No test infra today (`package.json` has no `test` script; `openspec/config.yaml` absent). Verification is manual via the 7-step Success Criteria in the proposal (db up, migrate clean, seed clean, prisma studio counts, smoke count = 3, `bun run dev` unchanged, `.env` gitignored). The smoke script IS the executable proxy for "DB has data" until a real test framework lands.

## Migration / Rollout

- **Dev**: `bun run db:up` → `bun run db:migrate` → `bun run db:seed` → `bun run db:studio` (visual) or `bun run db:smoke` (programmatic).
- **First-migration rule**: never edit `prisma/migrations/{ts}_init/` after merge. Future schema changes go in new migrations.
- **Rollback**: `docker compose down -v` (wipes volume), `rm -rf prisma/ src/lib/prisma.ts scripts/db-smoke.ts docker-compose.yml`, revert `package.json` and `.gitignore`. No frontend touched → app reverts to `data.json` + Zustand baseline.
- **Production**: this phase is dev-only. The wipe-and-reinsert seed MUST NOT run in prod; an idempotent UPSERT seed is a follow-up.

## Open Questions

- [ ] Dummy user: confirm `owner@kanban.local` / "Dev Owner" / `password: "TBD"`. The placeholder blocks any future Auth.js wiring until replaced.
- [ ] `Board.isActive` semantics: per proposal "controlled by OWNER only". Is there exactly one active board per user (auto-deactivate the rest), or a board-level flag independent of users? Affects auth-phase design.
- [ ] `db:reset` (`prisma migrate reset --force`) drops the schema — fine in dev. Should it require an env guard (`ALLOW_DB_RESET=1`) or rely on docs?
- [ ] No test infra today. The smoke script is the only executable check. Add Vitest/Playwright in a separate change to lift this off manual verification.
