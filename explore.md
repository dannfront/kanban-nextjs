# Exploration: Fase 3 — TanStack Query Migration

**Status**: completed

## Executive Summary

Replace Zustand data stores (`useBoardStore`, `useTaskStore`) with TanStack Query, connecting the 17 existing Server Actions to the frontend and eliminating `data.json` as the data source. The migration requires granular queries per entity, optimistic updates with rollback for mutations, and SSR prefetch via `HydrationBoundary` — all while preserving the DnD experience and keeping `useUIStore`/`useModalStore` untouched.

---

## 1. Query Strategy

### Recommendation: Granular queries per entity

| Query Key Pattern | Data | Why |
|---|---|---|
| `['boards']` | `getBoards()` | Sidebar needs board list independent of current board |
| `['boards', boardId]` | `getBoardWithColumns(boardId)` | Board-level data with columns |
| `['boards', boardId, 'tasks']` | Need new server action: `getTasksWithSubtasks(boardId)` | Tasks + subtasks for a board |

**Why NOT one big query:**
- Sidebar (`BoardNavLinks`, `DashboardShell`) needs board list without loading tasks for every board
- `useSuspenseQuery` with granular keys lets us show sidebar immediately while board data streams in
- Cache invalidation stays simple: mutating a task only invalidates `['boards', boardId, 'tasks']`, not the entire board tree

**Cache invalidation complexity per mutation:**
- Create/update/delete board → invalidate `['boards']` + `['boards', boardId]`
- Create/update/delete column → invalidate `['boards', boardId]`
- Create/update/delete/move task → invalidate `['boards', boardId, 'tasks']`
- Toggle subtask → invalidate `['boards', boardId, 'tasks']` (subtasks embedded in task response)

**New server action needed:** `getTasksWithSubtasks(boardId)` — the existing `getTasksForBoard` in `src/lib/tasks.ts` reads from `data.json`. We need a Prisma-based equivalent. The existing `getBoardWithColumns` already returns columns but not tasks.

---

## 2. Mutation Strategy

### 17 Server Actions → Mutation Hooks

| Server Action | Hook | Invalidation | Optimistic? |
|---|---|---|---|
| `createBoard` | `useCreateBoard` | `['boards']` | Yes — add to list |
| `updateBoard` | `useUpdateBoard` | `['boards']`, `['boards', id]` | Yes — patch name/columns |
| `deleteBoard` | `useDeleteBoard` | `['boards']` | Yes — remove from list |
| `getBoards` | `useSuspenseQuery(['boards'])` | N/A (query) | N/A |
| `getBoardWithColumns` | `useSuspenseQuery(['boards', id])` | N/A (query) | N/A |
| `createColumn` | `useCreateColumn` | `['boards', boardId]` | Yes — append column |
| `updateColumn` | `useUpdateColumn` | `['boards', boardId]` | Yes — patch column |
| `deleteColumn` | `useDeleteColumn` | `['boards', boardId]`, `['boards', boardId, 'tasks']` | Yes — remove column + cascade |
| `reorderColumns` | `useReorderColumns` | `['boards', boardId]` | Yes — reorder columns |
| `createTask` | `useCreateTask` | `['boards', boardId, 'tasks']` | Yes — append task |
| `updateTask` | `useUpdateTask` | `['boards', boardId, 'tasks']` | Yes — patch task |
| `deleteTask` | `useDeleteTask` | `['boards', boardId, 'tasks']` | Yes — remove task |
| `moveTask` | `useMoveTask` | `['boards', boardId, 'tasks']` | Yes — move between columns |
| `reorderTasksInColumn` | `useReorderTasks` | `['boards', boardId, 'tasks']` | Yes — reorder in column |
| `createSubtask` | `useCreateSubtask` | `['boards', boardId, 'tasks']` | Yes — append subtask |
| `toggleSubtask` | `useToggleSubtask` | `['boards', boardId, 'tasks']` | Yes — toggle isCompleted |
| `deleteSubtask` | `useDeleteSubtask` | `['boards', boardId, 'tasks']` | Yes — remove subtask |

**Optimistic update pattern:**
```ts
const queryClient = useQueryClient()

const mutation = useMutation({
  mutationFn: (input) => createTask(input),
  onMutate: async (input) => {
    await queryClient.cancelQueries({ queryKey: ['boards', boardId, 'tasks'] })
    const previous = queryClient.getQueryData(['boards', boardId, 'tasks'])
    queryClient.setQueryData(['boards', boardId, 'tasks'], (old) => /* optimistic update */)
    return { previous }
  },
  onError: (err, input, context) => {
    queryClient.setQueryData(['boards', boardId, 'tasks'], context.previous)
  },
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: ['boards', boardId, 'tasks'] })
  },
})
```

---

## 3. DnD Migration

### Current flow:
1. `handleDragStart` → snapshot `tasksByColumn`
2. `handleDragEnd` → `move(snapshot, event)` → compute new positions → `setTasks(nextTasks)` (local only)

### New flow:
1. `handleDragStart` → snapshot (same)
2. `handleDragEnd` → compute new positions → **optimistic update** + **server call**
3. Same column reorder → call `reorderTasksInColumn(columnId, orderedTaskIds)`
4. Cross-column move → call `moveTask(taskId, targetColumnId, newIndex)`

### Ordering mismatch resolution:
- **Frontend** computes sequential order `(0, 1, 2)` — this is correct for the UI snapshot
- **Server** uses gap-based `(1000, 2000, 3000)` — handles this internally via `computeInsertOrder`
- **Strategy:** Frontend sends the *index* (position in the array), server computes the actual gap-based order
- `reorderTasksInColumn` already receives `orderedTaskIds[]` — the server assigns `(index + 1) * 1000` to each
- `moveTask` receives `newIndex` — the server uses `computeInsertOrder(prev, next)` to find the gap
- **No conflict** — the frontend never needs to know about gap-based ordering

### Optimistic update for DnD:
```ts
// On drag end, immediately update cache with new positions
queryClient.setQueryData(['boards', boardId, 'tasks'], (old) => {
  // Apply move() result to old data
})

// Then fire the mutation (reorderTasksInColumn or moveTask)
// On settle, invalidate to get server truth
```

---

## 4. Data Source Migration (SSR → Prisma)

### Current:
```
data.json → src/lib/boards.ts + src/lib/tasks.ts → SSR page/layout → props → useEffect → Zustand
```

### New:
```
Server Component → server action → prisma → prefetchQuery → HydrationBoundary → client reads cache
```

### Implementation:

**Step 1:** Create `getTasksWithSubtasks` server action (reads Prisma, not data.json)

**Step 2:** In `page.tsx` (Server Component):
```tsx
import { getQueryClient } from '@/lib/get-query-client'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { getBoards } from '@/features/boards/actions'
import { getBoardWithColumns } from '@/features/boards/actions'
import { getTasksWithSubtasks } from '@/features/tasks/actions'

export default async function BoardPage({ params }) {
  const { boardId } = await params
  const queryClient = getQueryClient()

  // Parallel prefetch
  await Promise.all([
    queryClient.prefetchQuery({ queryKey: ['boards'], queryFn: () => getBoards() }),
    queryClient.prefetchQuery({ queryKey: ['boards', boardId], queryFn: () => getBoardWithColumns(boardId) }),
    queryClient.prefetchQuery({ queryKey: ['boards', boardId, 'tasks'], queryFn: () => getTasksWithSubtasks(boardId) }),
  ])

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <BoardView boardId={boardId} />
    </HydrationBoundary>
  )
}
```

**Step 3:** `layout.tsx` (DashboardShell) prefetches boards:
```tsx
const queryClient = getQueryClient()
await queryClient.prefetchQuery({ queryKey: ['boards'], queryFn: getBoards })

return (
  <HydrationBoundary state={dehydrate(queryClient)}>
    <DashboardShell>{children}</DashboardShell>
  </HydrationBoundary>
)
```

**Step 4:** Remove `src/lib/boards.ts`, `src/lib/tasks.ts`, and `data.json`

### Key: `getQueryClient` utility
```ts
// src/lib/get-query-client.ts
import { QueryClient } from '@tanstack/react-query'

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { staleTime: 60 * 1000 },
    },
  })
}

let browserQueryClient: QueryClient | undefined

export function getQueryClient() {
  if (typeof window === 'undefined') {
    return makeQueryClient()
  }
  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient()
  }
  return browserQueryClient
}
```

---

## 5. Type Unification

### Recommendation: Derive frontend types from Prisma types

**Current problem:**
- Frontend `Task` has `status: string` (column name) — does NOT exist in Prisma
- Frontend types omit `createdAt`, `updatedAt`, `ownerId`, `deletedAt`

**Solution:**

1. **Remove `Task.status`** — it's redundant. The column name is available via `column.name` when needed. Components that display status already have access to the column via `columns.find(c => c.id === task.columnId)`.

2. **Define query result types** that match what Server Actions actually return:
```ts
// src/features/tasks/types.ts
import type { Task as PrismaTask, Subtask as PrismaSubtask } from '@prisma/client'

export type TaskWithSubtasks = PrismaTask & { subtasks: PrismaSubtask[] }

// For components that need column context
export type TaskWithColumn = TaskWithSubtasks & {
  column: { id: string; name: string; color: string; boardId: string }
}
```

3. **Update `TaskForm`** — currently uses `status` (column name) for the Select dropdown. Change to use `columnId` directly:
```ts
// Before: status: z.string().min(1)
// After:  columnId: z.string().uuid()
```

4. **Update `ViewTaskModal`** — `moveTask(taskId, status)` resolves column by name. Change to `moveTask(taskId, targetColumnId)`.

---

## 6. Provider Placement

### Recommendation: Root layout (`src/app/layout.tsx`)

**Why root layout, not dashboard group layout:**
- TanStack Query's `QueryClientProvider` needs to wrap the entire app for cache consistency
- Creating a `(dashboard)/layout.tsx` route group layout would mean the provider only covers dashboard routes
- The provider is lightweight (just context) — no performance penalty at root level
- `HydrationBoundary` handles SSR data transfer, not the provider itself

**Implementation:**
```tsx
// src/app/layout.tsx
import { QueryProvider } from '@/components/providers/QueryProvider'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ThemeProvider>
          <QueryProvider>{children}</QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

// src/components/providers/QueryProvider.tsx
'use client'

import { useState } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { getQueryClient } from '@/lib/get-query-client'

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => getQueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools />
    </QueryClientProvider>
  )
}
```

---

## 7. File Structure

Following the project's feature-first architecture:

```
src/
├── lib/
│   ├── get-query-client.ts          # QueryClient factory (SSR-safe)
│   └── query-keys.ts                # Centralized query key factory
├── features/
│   ├── boards/
│   │   ├── actions.ts               # Existing (keep)
│   │   ├── schemas.ts               # Existing (keep)
│   │   ├── types.ts                 # Update: derive from Prisma
│   │   ├── hooks/
│   │   │   ├── useBoards.ts         # useSuspenseQuery(['boards'])
│   │   │   ├── useBoard.ts          # useSuspenseQuery(['boards', id])
│   │   │   ├── useCreateBoard.ts    # useMutation
│   │   │   ├── useUpdateBoard.ts    # useMutation
│   │   │   └── useDeleteBoard.ts    # useMutation
│   │   └── components/              # Existing (update to use hooks)
│   ├── columns/
│   │   ├── actions.ts               # Existing (keep)
│   │   ├── schemas.ts               # Existing (keep)
│   │   ├── hooks/
│   │   │   ├── useCreateColumn.ts   # useMutation
│   │   │   ├── useUpdateColumn.ts   # useMutation
│   │   │   ├── useDeleteColumn.ts   # useMutation
│   │   │   └── useReorderColumns.ts # useMutation
│   │   └── components/              # Existing (update)
│   ├── tasks/
│   │   ├── actions.ts               # Existing (add getTasksWithSubtasks)
│   │   ├── schemas.ts               # Existing (keep)
│   │   ├── types.ts                 # Update: derive from Prisma
│   │   ├── hooks/
│   │   │   ├── useTasks.ts          # useSuspenseQuery(['boards', id, 'tasks'])
│   │   │   ├── useCreateTask.ts     # useMutation
│   │   │   ├── useUpdateTask.ts     # useMutation
│   │   │   ├── useDeleteTask.ts     # useMutation
│   │   │   ├── useMoveTask.ts       # useMutation (DnD)
│   │   │   ├── useReorderTasks.ts   # useMutation (DnD)
│   │   │   ├── useToggleSubtask.ts  # useMutation
│   │   │   └── useDeleteSubtask.ts  # useMutation
│   │   └── components/              # Existing (update)
├── components/
│   └── providers/
│       └── QueryProvider.tsx         # Client component wrapper
├── store/
│   ├── useUIStore.ts                 # KEEP (localStorage persisted)
│   └── useModalStore.ts             # KEEP (stack-based modal)
├── features/boards/store/
│   └── useBoardStore.ts             # DELETE after migration
├── features/tasks/store/
│   └── useTaskStore.ts              # DELETE after migration
```

### Query Key Factory:
```ts
// src/lib/query-keys.ts
export const queryKeys = {
  boards: {
    all: ['boards'] as const,
    detail: (id: string) => ['boards', id] as const,
    tasks: (boardId: string) => ['boards', boardId, 'tasks'] as const,
  },
}
```

---

## 8. Implementation Order

### Phase 3A: Foundation (low risk, enables everything)
1. Install `@tanstack/react-query` + `@tanstack/react-query-devtools`
2. Create `getQueryClient` utility
3. Create `QueryProvider` component
4. Add provider to root layout
5. Create `queryKeys` factory
6. Create `getTasksWithSubtasks` server action (Prisma-based)

### Phase 3B: Read Path (replace data.json SSR)
7. Migrate `layout.tsx` — prefetch `['boards']`, use `HydrationBoundary`
8. Migrate `page.tsx` — prefetch `['boards', id]` + `['boards', id, 'tasks']`
9. Create `useBoards`, `useBoard`, `useTasks` hooks
10. Update `DashboardShell` to read from query instead of Zustand
11. Update `BoardNavLinks` to read from query
12. Update `ColumnList`, `Column`, `TaskList`, `TaskCard` to read from query
13. Delete `src/lib/boards.ts`, `src/lib/tasks.ts`, `data.json`

### Phase 3C: Write Path — Simple Mutations
14. Create mutation hooks for boards (`useCreateBoard`, `useUpdateBoard`, `useDeleteBoard`)
15. Update `AddBoardModal`, `EditBoardModal`, `DeleteBoardModal`
16. Create mutation hooks for columns
17. Update `ColumnFields`, `ConfirmDeleteColumnModal`
18. Create mutation hooks for tasks (`useCreateTask`, `useUpdateTask`, `useDeleteTask`)
19. Update `AddTaskModal`, `EditTaskModal`, `DeleteTaskModal`
20. Create `useToggleSubtask`, `useDeleteSubtask`
21. Update `ViewTaskModal`

### Phase 3D: Type Unification
22. Remove `Task.status` from frontend types
23. Update `TaskForm` to use `columnId` instead of `status`
24. Update `ViewTaskModal` status select to use `columnId`
25. Update all components that reference `task.status`

### Phase 3E: DnD Migration
26. Create `useMoveTask` and `useReorderTasks` hooks with optimistic updates
27. Refactor `BoardView.handleDragEnd` to call server actions
28. Remove `useTaskStore.reorderTask` and `useTaskStore.moveTask`
29. Test DnD with network latency simulation

### Phase 3F: Cleanup
30. Delete `useBoardStore.ts` and `useTaskStore.ts`
31. Delete `StoreHydration.tsx` (if no longer needed)
32. Remove Zustand data dependencies from all components
33. Run full regression test

---

## Risks

| # | Risk | Severity | Mitigation |
|---|---|---|---|
| 1 | **Task.status removal breaks many components** | HIGH | Do type unification (Phase 3D) BEFORE DnD migration. Update all references systematically with grep. |
| 2 | **Optimistic DnD rollback causes visual jank** | MEDIUM | Use `setQueryData` for instant UI, `invalidateQueries` only on settle. If server rejects, rollback smoothly. |
| 3 | **Server Actions return ActionResult<T> — must unwrap in hooks** | LOW | Create a thin `unwrapAction` helper: `if (!result.success) throw new Error(result.error)`. |
| 4 | **BoardFormFields reads Zustand in Zod superRefine** | MEDIUM | Pass boards list as prop to the resolver creator, or read from queryClient cache. |
| 5 | **Cascade delete coupling disappears** | LOW | Server already handles cascade via `softDeleteBoard`/`softDeleteColumn` transactions. No client-side cascade needed. |
| 6 | **data.json IDs aren't UUIDs** | LOW | Seed script already generates UUIDs. data.json is deleted entirely. |
| 7 | **revalidatePath conflicts with TanStack cache** | MEDIUM | Server Actions call `revalidatePath` which triggers RSC re-render. With TanStack, we use `invalidateQueries` instead. May need to remove `revalidatePath` from actions or let both coexist (harmless double-refresh). |

---

## Approaches Considered

### Approach A: Granular Queries (RECOMMENDED)
- Separate queries for boards, board+columns, tasks
- Simple invalidation per entity
- Loading states per section (sidebar loads independently)
- **Effort: Medium**

### Approach B: Single Board Query
- One query returns board + columns + tasks + subtasks
- Simpler data flow, fewer queries
- But: sidebar must wait for full board load, invalidation is coarse
- **Effort: Low**

### Approach C: Keep Zustand for State, TanStack for Fetching
- TanStack handles server sync, Zustand holds derived state
- Avoids rewriting all consumers
- But: adds complexity of two state systems, defeats the purpose
- **Effort: Medium-High** (and fragile)

**Approach A wins** because it matches the existing component boundaries, allows independent loading states, and keeps invalidation surgical.

---

## Ready for Proposal

**Yes.** All evaluation areas are resolved. The orchestrator should proceed to `sdd-propose`.

Key decisions to carry forward:
1. Granular query strategy (3 query key families)
2. Optimistic updates for all mutations
3. DnD sends index, server computes gap-based order
4. SSR prefetch with `HydrationBoundary` replaces data.json
5. `Task.status` removed, replaced by column relation lookup
6. Provider at root layout
7. Feature-first hooks in `features/*/hooks/`
8. 6-phase implementation order (Foundation → Reads → Writes → Types → DnD → Cleanup)
