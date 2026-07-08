# Proposal: Board Modals (Add / Edit / Delete)

## Intent

The user can navigate boards but cannot create, rename, or remove one from the UI. `useModalStore` already declares `add-board | edit-board | delete-board` and `ModalRouter` has no cases; `+ Create New Board` is disabled and the TopMenu kebab onClick is a no-op. Ship the three modals so the full board lifecycle runs from existing chrome.

## Scope

### In Scope
- `AddBoardModal`, `EditBoardModal`, `DeleteBoardModal`, `ConfirmDeleteColumnModal` (stacked).
- Shared `BoardFormFields` with react-hook-form + zod (mirrors `TaskForm`).
- `useBoardStore`: `boards`, `setBoards`, `addBoard`, `updateBoard`, `deleteBoard` (cascades).
- `useTaskStore.deleteTasksForBoard(boardId)`.
- Hydrate boards from prop once per route; `BoardNavLinks` + `TopMenu` read from store.
- `+ Create New Board` enabled; `router.push` after create; redirect after deleting active board.
- TopMenu kebab: `KebabMenuButton` + `DropdownMenu` + `DropdownMenuItem` (Edit / Delete).
- Zod refinement: name unique within `useBoardStore.getState().boards` (excluding current board on Edit).
- 480px desktop / 295px mobile, light + dark.

### Out of Scope

Server persistence, column color picker, drag-to-reorder columns, task reassignment, default column templates.

## Capabilities

### New Capabilities
- `board-modals`: Add, Edit, Delete, and column-removal-confirmation modals driven by `useModalStore`; mutations in client-side `useBoardStore` and `useTaskStore`.

### Modified Capabilities
- None — `Board` and `Column` types reused as-is.

## Approach

Client modals via `Modal size="md"` (480px) + `min-w-[295px]`. `ModalRouter` adds 4 cases: `add-board` (no payload), `edit-board` (`{ boardId }`), `delete-board` (`{ boardId }`), `confirm-delete-column` (`{ boardId, columnId, columnName }`). `BoardFormFields` is a controlled shared component; columns are a `useFieldArray`. Validation: name required + unique via `.superRefine` reading `useBoardStore.getState().boards` at submit; each column name required. `addBoard` generates `id` via `crypto.randomUUID()`; columns get sequential `order`, generated `id`, default color, new `boardId`. `DashboardShell` hydrates the store on mount; consumers read from it. `deleteBoard` filters the board + its columns out and calls `useTaskStore.getState().deleteTasksForBoard(boardId)`.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/features/boards/store/useBoardStore.ts` | Modified | Adds boards state + CRUD + cascade. |
| `src/features/boards/components/{Add,Edit,Delete}BoardModal.tsx` | New | The three modals. |
| `src/features/boards/components/ConfirmDeleteColumnModal.tsx` | New | Stacked column-deletion confirmation. |
| `src/features/boards/components/BoardFormFields.tsx` | New | Shared form for Add + Edit. |
| `src/store/ModalRouter.tsx` | Modified | Adds 4 new cases. |
| `src/features/tasks/store/useTaskStore.ts` | Modified | Adds `deleteTasksForBoard`. |
| `src/features/boards/components/BoardNavLinks.tsx` | Modified | Reads from store; enables `+ Create New Board`. |
| `src/components/layout/TopMenu.tsx` | Modified | Kebab opens dropdown with Edit/Delete. |
| `src/components/layout/DashboardShell.tsx` | Modified | Hydrates `useBoardStore.setBoards` on mount. |
| `src/store/useModalStore.ts` | Modified | Adds `confirm-delete-column` to `ModalType`. |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Zod `.superRefine` reads stale boards | Med | `useBoardStore.getState()` at submit, not closure. |
| Deleting active board leaves 404 | Med | Redirect to first remaining board or `/`. |
| Edit + Confirm stack double backdrop | Low | Reuse `Modal`; only top listens to Escape. |
| Cascade hits other boards' tasks | Low | `deleteTasksForBoard` filters by `boardId` only. |
| Store changes break `BoardView` | Low | New actions additive; `columns`/`setColumns` untouched. |

## First-Slice Boundary

Add and Edit share `BoardFormFields` (splitting duplicates ~80% of the form). Delete is small. Confirm-column is required to safely land Edit. **Ship all four modals + store extensions in one slice**, ordered: `useTaskStore.deleteTasksForBoard` → `useBoardStore` CRUD + hydration → `BoardFormFields` → Add + Edit modals → `ConfirmDeleteColumnModal` → `DeleteBoardModal` → TopMenu kebab → sidebar `+ Create New Board`.

## Rollback Plan

Revert `ModalRouter` cases + TopMenu kebab wiring; modals become unreachable. New store actions are additive. If cascade regresses, `useBoardStore.deleteBoard` is the single point to guard or remove.

## Dependencies

UI primitives: `Modal`, `ModalTitle`, `Input`, `Button`, `KebabMenuButton`, `DropdownMenu`, `DropdownMenuItem`. Stores: `useModalStore`, `useBoardStore`, `useTaskStore`. Types: `src/features/boards/types.ts`. Designs: `diseño/full-design/Desktop - {Add,Edit,Delete} Board - Light.jpg` (+ Dark / Mobile / Tablet variants).

## Success Criteria

- [ ] `+ Create New Board` opens `AddBoardModal`; submit creates the board and navigates to it.
- [ ] Board name uniqueness enforced (inline Zod error blocks submit).
- [ ] TopMenu kebab → Edit Board opens prefilled; Save Changes updates name + columns.
- [ ] Removing an empty column in Edit removes it immediately; removing a column with tasks opens `ConfirmDeleteColumnModal` (Cancel returns to Edit, Confirm cascades).
- [ ] `+ Add New Column` appends an empty column row in Add/Edit.
- [ ] TopMenu kebab → Delete Board opens `DeleteBoardModal`; Confirm removes board + columns + tasks; route redirects when the active board is deleted.
- [ ] All four modals render at 480px desktop and ≥295px mobile in light + dark.
- [ ] Escape and backdrop click close every modal (confirm-column does not close Edit).
