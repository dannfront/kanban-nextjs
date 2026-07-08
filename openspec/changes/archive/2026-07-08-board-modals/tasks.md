# Tasks: Board Modals (Add / Edit / Delete + Confirm Column)

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~520 |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 → PR 2 → PR 3 |
| Delivery strategy | ask-on-risk |
| Chain strategy | feature-branch-chain |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: feature-branch-chain
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | PR | Base | Notes |
|------|------|----|------|-------|
| 1 | Store extensions, hydration, nav wiring | PR 1 | `feature/board-modals` | ~130 lines |
| 2 | BoardFormFields + Add/Edit modals | PR 2 | PR 1 branch | ~290 lines |
| 3 | Delete/Confirm modals + TopMenu kebab | PR 3 | PR 2 branch | ~100 lines |

## Phase 1: Foundation (Store + Hydration + Nav)

- [x] **T1.1** `src/features/boards/store/useBoardStore.ts` (~+50 lines) — Add `boards`, `setBoards`, `addBoard`, `updateBoard`, `deleteBoard`, `deleteColumn`. AC: Store compiles; `addBoard` returns UUID; `deleteBoard` cascades columns.
- [x] **T1.2** `src/features/tasks/store/useTaskStore.ts` (~+15 lines) — Add `deleteTasksForBoard(boardId)` and `deleteTasksForColumn(columnId)`. AC: Both filter `tasks` correctly.
- [x] **T1.3** `src/store/useModalStore.ts` (~+1 line) — Add `"confirm-delete-column"` to `ModalType`. AC: Type compiles.
- [x] **T1.4** `src/components/layout/DashboardShell.tsx` (~+8 lines, dep: T1.1) — Add `useEffect` to call `setBoards(boards)`. AC: Nav links read live boards after hydration.
- [x] **T1.5** `src/features/boards/components/BoardNavLinks.tsx` (~+12 lines, dep: T1.1, T1.4) — Read `boards` from store; wire `+ Create New Board` → `openModal("add-board")`. AC: List renders from store; button opens modal.

## Phase 2: Core Modals (Form + Add/Edit)

- [x] **T2.1** `src/features/boards/components/BoardFormFields.tsx` (~+180 lines) — Create RHF+Zod form with `useFieldArray` for columns and `.superRefine` uniqueness. Props: `mode`, `defaultValues?`, `excludeBoardId?`, `onRemoveColumn`, `onSubmit`. AC: Validates name, columns>=1, uniqueness; supports add/remove rows.
- [x] **T2.2** `src/features/boards/components/AddBoardModal.tsx` (~+40 lines, dep: T2.1, T1.1) — Wrap `BoardFormFields mode="create"`; submit → `addBoard` → `router.push` → `closeModal`. AC: Modal opens, submits, redirects.
- [x] **T2.3** `src/features/boards/components/EditBoardModal.tsx` (~+55 lines, dep: T2.1, T1.1) — Prefill from store; submit → `updateBoard`; `onRemoveColumn` → `openModal("confirm-delete-column")`. AC: Prefills; updates; triggers confirm for columns with tasks.
- [x] **T2.4** `src/store/ModalRouter.tsx` (~+18 lines, dep: T2.2, T2.3) — Add `add-board` and `edit-board` cases. AC: Renders both modals.

## Phase 3: Delete Flows + TopMenu

- [x] **T3.1** `src/features/boards/components/DeleteBoardModal.tsx` (~+45 lines, dep: T1.1, T1.2) — Red title, board name in body, destructive Confirm; `deleteBoard` then redirect if active. AC: Deletes board, cascades, redirects.
- [x] **T3.2** `src/features/boards/components/ConfirmDeleteColumnModal.tsx` (~+40 lines, dep: T1.1, T1.2) — Stacked modal with task count; Confirm → `deleteColumn` + `deleteTasksForColumn`. AC: Column and tasks removed; cancel returns to Edit.
- [x] **T3.3** `src/store/ModalRouter.tsx` (~+18 lines, dep: T3.1, T3.2) — Add `delete-board` and `confirm-delete-column` cases. AC: Renders both modals.
- [x] **T3.4** `src/components/layout/TopMenu.tsx` (~+40 lines, dep: T1.1, T3.3) — Add kebab dropdown ("Edit Board", "Delete Board"); read `boards` from store; disable when no `boardId`. AC: Dropdown triggers correct modals.

## Phase 4: Verification

- [x] **T4.1** Manual QA (dep: all) — Run `pnpm dev`; verify all 7 proposal success criteria. AC: Add→route, uniqueness error, edit prefill/columns, confirm cascade, delete cascade, responsive, Escape/backdrop all pass.
