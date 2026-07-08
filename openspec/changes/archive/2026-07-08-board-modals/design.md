# Design: Board Modals (Add / Edit / Delete + Confirm Column)

## Technical Approach

Extend client stores with full board CRUD, ship four modals wired into `ModalRouter`, and drive them from the already-declared `add-board | edit-board | delete-board` modal types (plus a new `confirm-delete-column`). Reuse the `TaskForm` pattern for a shared `BoardFormFields` (RHF + Zod + `useFieldArray`); reuse `Modal`/`ModalTitle`/`Input`/`Button` and the kebab/dropdown combo from `ViewTaskModal`. `useBoardStore` only stores `Column[]` today — we add `boards: Board[]` next to it. `DashboardShell` becomes the single hydration point (mirroring how `BoardView` hydrates columns/tasks).

## Architecture Decisions

| # | Decision | Choice | Tradeoff | Rationale |
|---|----------|--------|----------|-----------|
| D1 | Where to store boards | Add `boards: Board[]` to existing `useBoardStore` (+ new `setBoards`) | One more field in a store that already owns board-shaped data | Keeps board/column state co-located; mirrors how `BoardView` already hydrates `columns`/`tasks`. |
| D2 | Board id generation | `crypto.randomUUID()` inside `addBoard` | Client-only id (no server) | Matches `useTaskStore.addTask` exactly. |
| D3 | Uniqueness check timing | `.superRefine` reads `useBoardStore.getState().boards` at submit | Reaches outside RHF's zod instance | Store is the live source of truth; `getState()` avoids the stale-closure trap that `useStore()` would hit. |
| D4 | Uniqueness on Edit | `excludeBoardId` prop on `BoardFormFields`; skip matching row | One extra prop | Prevents "name unchanged" from being flagged as duplicate. |
| D5 | Confirm-column flow | Reuse `Modal` for both; the later-mounted Confirm modal wins Escape; Confirm's `onClose` is `closeModal()` so it returns to Edit | Two stacked modals; backdrop interaction is implicit | Existing `Modal` supports nesting because each instance registers its own keydown listener. |
| D6 | `deleteBoard` cascade | `useBoardStore.deleteBoard` filters `boards` + `columns` and calls `useTaskStore.getState().deleteTasksForBoard(boardId)` | Cross-store mutation from inside a board-store action | Mirrors `moveTask` calling `useBoardStore.getState().columns`. |
| D7 | Redirect after delete | `DeleteBoardModal` reads `useParams`, then `router.push` to first surviving board or `/` | Caller (modal) controls nav | Keeps `deleteBoard` a pure state mutation. |
| D8 | Form scope | `BoardFormFields` is presentational + form-only; Add/Edit modals own submit + store calls | Duplicates wiring per modal | Matches `TaskForm` pattern exactly. |

## Data Flow

```
ADD:    BoardNavLinks "+ Create New Board" → openModal("add-board")
        ModalRouter → AddBoardModal → BoardFormFields
        submit → addBoard() → router.push("/kanban-dashboard/{id}") → closeModal

EDIT:   TopMenu kebab → "Edit Board" → openModal("edit-board", { boardId })
        EditBoardModal → BoardFormFields (prefilled)
        remove column (has tasks) → BoardFormFields.onRemoveColumn
          → openModal("confirm-delete-column", { boardId, columnId, columnName })
        ConfirmDeleteColumnModal stacked:
          Cancel  → closeModal()                                (returns to Edit, fields intact)
          Confirm → deleteColumn() + deleteTasksForColumn() → closeModal()
        "Save Changes" → updateBoard() → closeModal()

DELETE: TopMenu kebab → "Delete Board" → openModal("delete-board", { boardId })
        Confirm → deleteBoard() (cascades)
          if (id === useParams().boardId) router.push(first-surviving-id or "/")
          → closeModal

HYDRATE: BoardLayout (RSC) → getBoards() → DashboardShell(boards)
         useEffect: useBoardStore.getState().setBoards(boards)
         BoardNavLinks + TopMenu then read from the store
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/store/useModalStore.ts` | Modify | Extend `ModalType` with `"confirm-delete-column"`. |
| `src/features/boards/store/useBoardStore.ts` | Modify | Add `boards`, `setBoards`, `addBoard`, `updateBoard`, `deleteBoard`, `deleteColumn`. Keep `columns`/`setColumns`. |
| `src/features/tasks/store/useTaskStore.ts` | Modify | Add `deleteTasksForBoard(boardId)` and `deleteTasksForColumn(columnId)`. |
| `src/features/boards/components/board-form-fields.tsx` | Create | RHF + Zod, `useFieldArray`, `.superRefine` uniqueness, `+ Add New Column`, per-row remove. Props: `mode`, `defaultValues?`, `excludeBoardId?`, `onRemoveColumn`, `onSubmit`. |
| `src/features/boards/components/add-board-modal.tsx` | Create | Wraps `BoardFormFields mode="create"`; submit calls `addBoard`, `router.push`, `closeModal`. |
| `src/features/boards/components/edit-board-modal.tsx` | Create | Prefills from active board; submit calls `updateBoard`, `closeModal`. |
| `src/features/boards/components/delete-board-modal.tsx` | Create | Red title, description with board name, destructive Confirm, redirect logic. |
| `src/features/boards/components/confirm-delete-column-modal.tsx` | Create | Stacked modal: red title, body lists task count, Confirm = `deleteColumn` + `deleteTasksForColumn`. |
| `src/store/ModalRouter.tsx` | Modify | 4 new `case` arms (`add-board`, `edit-board` `{boardId}`, `delete-board` `{boardId}`, `confirm-delete-column` `{boardId, columnId, columnName}`). |
| `src/components/layout/DashboardShell.tsx` | Modify | `useEffect(() => useBoardStore.getState().setBoards(boards), [boards])`. Drop `boards` prop forward. |
| `src/features/boards/components/board-nav-links.tsx` | Modify | Read `boards` from `useBoardStore`; enable `+ Create New Board` button → `openModal("add-board")`. |
| `src/components/layout/top-menu.tsx` | Modify | Read `boards` from `useBoardStore`; add `useRef` + `useState` for kebab menu; render `DropdownMenu` with "Edit Board" + "Delete Board" (destructive). Disable kebab when no `boardId`. |

> Note: existing files above use PascalCase (`BoardNavLinks.tsx`). The File Changes table reflects the actual on-disk casing of files that already exist; **new** files MUST use kebab-case per the project's filename convention — see Naming Conventions.

## Interfaces / Contracts

```ts
// useBoardStore (additive)
boards: Board[]
setBoards(next: Board[]): void
addBoard(input: { name: string; columns: { name: string }[] }): string   // returns new board id
updateBoard(boardId: string, patch: {
  name?: string
  columns: { id?: string; name: string }[]   // existing rows have id, new rows don't
}): void
deleteBoard(boardId: string): void                                       // cascades columns + tasks
deleteColumn(boardId: string, columnId: string): void                    // also wipes tasks in that column

// useTaskStore (additive)
deleteTasksForBoard(boardId: string): void
deleteTasksForColumn(columnId: string): void

// useModalStore.ModalType (additive)
| "confirm-delete-column"   // payload: { boardId, columnId, columnName }

// Zod (BoardFormFields)
const columnSchema = z.object({ id: z.string().optional(), name: z.string().min(1).max(255) })
const boardFormSchema = z.object({
  name: z.string().min(1, "Can't be empty").max(255),
  columns: z.array(columnSchema).min(1, "Add at least one column"),
}).superRefine((data, ctx) => {
  const others = useBoardStore.getState().boards
    .filter(b => b.id !== excludeBoardId)
    .map(b => b.name.trim().toLowerCase())
  if (others.includes(data.name.trim().toLowerCase()))
    ctx.addIssue({ code: "custom", path: ["name"], message: "Already exists" })
})
```

Defaults: new column color `"#8471F2"` (from existing `data.json` palette); `order` is sequential `0..n-1`; new `id` is `crypto.randomUUID()`; new column `boardId` matches the freshly created board.

## Error Handling

- Empty name / zero columns → Zod `.min(1)` blocks at the matching path.
- Stale zod closure on uniqueness → `useBoardStore.getState().boards` reads at submit time.
- Active board deleted → redirect runs **after** the store mutation, not before.
- Confirm stacked over Edit → only the top modal (mount order: Edit first, Confirm second) registers its keydown listener; Confirm `onClose` returns to Edit without closing it.
- Modal mounted for a non-existent boardId (race) → read via `useBoardStore.getState().boards.find(...)`; if missing, `closeModal()`. Edit falls back to a "Board not found" body, mirroring `DeleteTaskModal`'s "Task not found" pattern.

## Testing Strategy

No test infra today (`package.json` has no `test` script; `openspec/config.yaml` absent → `tdd: false`, `test_command: ""`). Verification is manual via `pnpm dev` and the proposal's 7-step Success Criteria checklist (add → route; uniqueness error; Edit prefill + column add/remove; Confirm cascade; Delete cascade; mobile 295px / desktop 480px; Escape + backdrop).

## Migration / Rollout

No data migration. Rollback = revert the four new modal files, the four new `ModalRouter` cases, the kebab wiring, the `+ Create New Board` enable line, and the hydration. All store actions are additive.

## Naming & Styling Conventions

- **New** filenames: kebab-case (`add-board-modal.tsx`, `board-form-fields.tsx`, `confirm-delete-column-modal.tsx`). **Existing** files keep their PascalCase casing (e.g. `BoardNavLinks.tsx`) — don't rename in this change.
- Component exports: PascalCase (`AddBoardModal`, `BoardFormFields`).
- Folder: `src/features/boards/components/` for the four modals and the shared form. Leave the `columns/` subfolder untouched.
- Tailwind: reuse `text-[var(--color-red)]` on destructive titles (mirrors `DeleteTaskModal`); `Button variant="destructive"` for Confirm; `variant="primary"` for Add/Edit submit; `variant="secondary"` for Cancel.
- Modal sizing: `<Modal size="md" className={cn(modalCardClassName)}>` — `max-w-[480px]` desktop, `min-w-[295px]` mobile (from `lib/modalCard.ts`).
- Spacing: `space-y-6` between title and form body (matches `AddTaskModal`).
- Stacked modals: both render `z-50`; React mount order (Edit first, Confirm second) puts Confirm on top.

## Open Questions

- [ ] After deleting the last board, redirect goes to `/`. Confirm with the user whether to render an empty-state page or auto-create a default seed board.
- [ ] `updateBoard` "preserves column ids" is the spec's intent — confirm an existing column whose name was changed keeps its `id` and only updates its name (planned: yes, match by `id` from the form, rows without `id` are new).
