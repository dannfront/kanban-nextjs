# Proposal: Fase 1 — Backend Schema (PostgreSQL + Prisma + Docker)

## Intent

Today every byte of state lives in `data.json` and is mirrored into Zustand stores (`useBoardStore`, `useTaskStore`). There is no persistence layer, no multi-user story, and no source of truth outside the browser. This change lays the **foundation only**: a PostgreSQL database running in Docker, a Prisma v7 schema mirroring the agreed domain model, a first migration, and a seed that reproduces the current `data.json` snapshot under a dummy OWNER user. Nothing else (no Server Actions, no Auth.js, no TanStack Query, no frontend wiring) ships in this phase — it is the prerequisite that later phases will build on.

## Scope

### In Scope
- `docker-compose.yml` with `postgres:latest`, persistent volume, exposed on `localhost:5432`.
- Install `prisma` (dev) and `@prisma/client` (runtime).
- `prisma/schema.prisma` with `User`, `Board`, `BoardMember`, `Column`, `Task`, `Subtask`, and `BoardRole` enum (see Architecture Decisions).
- `.env` with `DATABASE_URL` (gitignored), plus `.env.example` for the repo.
- First migration: `prisma migrate dev --name init`.
- `prisma/seed.ts` — creates 1 dummy `User` (OWNER of all boards), inserts the 3 boards, 9 columns, 22 tasks, and their subtasks from `data.json`. Preserve `order` values verbatim.
- `src/lib/prisma.ts` — Prisma client singleton (HMR-safe on Next dev).
- Verify: `prisma studio` shows seeded rows; a one-off `tsx`/`node` smoke check that `prisma.board.findMany()` returns 3 boards.
- Update `package.json` scripts: `db:up`, `db:down`, `db:migrate`, `db:seed`, `db:studio`, `prisma`.

### Out of Scope
- Server Actions, API Routes, Auth.js v5, TanStack Query.
- Any frontend change (`useBoardStore` / `useTaskStore` keep reading `data.json` until later phases).
- Production deploy, CI, backups, role enforcement in code (roles exist in schema only).

## Capabilities

### New Capabilities
- None. This change is infrastructure only; no spec-level behavior changes yet.

### Modified Capabilities
- None. `openspec/specs/boards/spec.md` describes client-store semantics; the DB is invisible to it until a later phase wires it.

## Approach

- **Docker first.** Compose with one service, named volume `pgdata`, port `5432`. `postgres:latest` per agreed decision.
- **Schema as agreed.** Six models, all with `createdAt` / `updatedAt`; `Board`, `Column`, `Task`, `Subtask` carry `deletedAt DateTime?` for soft delete. `User.password` is `String` (hash happens in the auth phase). `BoardRole` enum: `OWNER | EDITOR | GUEST`. IDs are `String @id @default(uuid())`. `Column.order` and `Task.order` are `Int` (fractional index contract, rebalance logic deferred).
- **Migration discipline.** Single `init` migration; never edit after merge. Future changes go in new migrations.
- **Seed strategy.** Read `data.json` synchronously at seed time, build a `boardId` map from mock id → generated UUID, then insert in dependency order: user → boards → boardMembers (OWNER rows) → columns → tasks → subtasks. Seed is idempotent: it wipes and re-inserts on every run (acceptable for dev only).
- **Client singleton.** Standard pattern: store `PrismaClient` on `globalThis` in non-prod to survive HMR.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `docker-compose.yml` | New | Postgres service. |
| `prisma/schema.prisma` | New | Full domain schema. |
| `prisma/migrations/{timestamp}_init/` | New | First migration. |
| `prisma/seed.ts` | New | data.json → DB. |
| `src/lib/prisma.ts` | New | Client singleton. |
| `.env` / `.env.example` | New | `DATABASE_URL`. |
| `package.json` | Modified | Prisma deps + db scripts. |
| `.gitignore` | Modified | Ignore `.env`, `prisma/dev.db*`. |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Docker not running / port 5432 in use | Med | `db:up` script fails fast; README points to troubleshooting. |
| Seed nondeterminism on re-run | Low | Wipe-and-reinsert; document as dev-only. |
| `postgres:latest` is a moving target | Low | Pin to a major tag (`postgres:17`) in a follow-up if stability bites; tracking ticket noted. |
| `User.password` as plain `String` looks wrong in schema review | Med | Comment in schema: "hashed by Auth.js in auth phase". |
| Schema drift between `prisma/schema.prisma` and `data.json` shape | Low | Seed asserts expected board/column/task counts before insert. |

## Non-Goals

- Auth, sessions, role enforcement, server mutations, client cache, productionization, multi-tenant data isolation.

## Rollback Plan

- `docker compose down -v` removes DB + volume. Delete `prisma/`, `src/lib/prisma.ts`, revert `package.json`. No frontend code touched → app reverts to pure `data.json` + Zustand baseline.

## Dependencies

- Docker Desktop (or compatible engine), Bun (already used).

## Success Criteria

- [ ] `docker compose up -d` brings Postgres up; `psql` connects on `localhost:5432`.
- [ ] `prisma migrate dev --name init` produces a clean migration, no warnings.
- [ ] `prisma db seed` finishes without errors.
- [ ] `prisma studio` shows: 1 user, 3 boards, 9 columns, 22 tasks, all subtasks.
- [ ] `bun run scripts/db-smoke.ts` prints board count = 3.
- [ ] `bun run dev` still renders the existing board UI unchanged (data still comes from `data.json`).
- [ ] `.env` is gitignored; `.env.example` is committed with placeholder values.
