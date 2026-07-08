# Spec: Board Modals (Add / Edit / Delete + Confirm Column)

## Purpose

Ship four modals (`AddBoardModal`, `EditBoardModal`, `DeleteBoardModal`, `ConfirmDeleteColumnModal`), a shared `BoardFormFields` (RHF + Zod + `useFieldArray`), and store extensions so the full board lifecycle works from the existing sidebar + TopMenu chrome. Types reused unchanged.

## Data Model / State Changes

| Store | Addition |
|-------|----------|
| `useBoardStore` | `boards: Board[]`, `setBoards`, `addBoard` (`crypto.randomUUID()` + `isActive: true`), `updateBoard` (preserves column ids), `deleteBoard` (cascades). |
| `useTaskStore` | `deleteTasksForBoard(boardId)`. |
| `useModalStore.ModalType` | `+ "confirm-delete-column"` (payload `{ boardId, columnId, columnName }`). |

## Zod Schema (BoardFormFields)

`name`: min 1, max 255. `columns`: array min 1; each `{ id?: string, name: min 1 }`. `.superRefine` reads `useBoardStore.getState().boards` at submit, flags duplicate names (excluding `excludeBoardId` on Edit) on `path: ["name"]` with "Already exists".

## Functional Requirements

| # | Requirement |
|---|-------------|
| R1 | `AddBoardModal` opens from `+ Create New Board`; on submit creates board + columns, then `router.push` to `/kanban-dashboard/{newId}`. |
| R2 | `EditBoardModal` opens prefilled with the active board's name + columns; submit updates them atomically. |
| R3 | `DeleteBoardModal` shows a red title with the board's name in the description; Confirm removes board + columns + tasks; if the deleted board is active, redirect to the first remaining board or `/`. |
| R4 | Removing a column that owns tasks in Edit opens `ConfirmDeleteColumnModal` stacked on top; Cancel returns unchanged, Confirm deletes the column + tasks. Removing an empty column is immediate. |
| R5 | `BoardFormFields` is controlled RHF + Zod with `useFieldArray` for columns, `+ Add New Column` button, and per-row remove. Submit label: "Create New Board" on Add, "Save Changes" on Edit. |
| R6 | Board name is unique within the live store; duplicates are blocked with an inline error. |
| R7 | `DashboardShell` calls `setBoards(boards)` once on mount; `BoardNavLinks` and `TopMenu` read from the store. |
| R8 | TopMenu kebab opens a `DropdownMenu` with "Edit Board" and "Delete Board"; outside-click closes it. |

### Scenarios

#### Scenario: R1 — Create board
- GIVEN no board with the submitted name exists
- WHEN the user submits `AddBoardModal` with 3 columns
- THEN a new board + 3 columns appear in the stores and the route changes to `/kanban-dashboard/{newId}`

#### Scenario: R4 — Remove column with tasks
- GIVEN a column that owns 2 tasks
- WHEN the user clicks its remove control
- THEN `ConfirmDeleteColumnModal` opens stacked; Cancel returns unchanged, Confirm deletes the column + 2 tasks and closes Edit

#### Scenario: R3 — Delete active board
- GIVEN the user is on "Roadmap"
- WHEN the user confirms deletion
- THEN board, columns, and tasks are removed and the route changes to the first remaining board, or `/` if none

#### Scenario: R7 — Hydration
- WHEN `DashboardShell` mounts with a `boards` prop
- THEN `useBoardStore.boards` equals that prop on first render

## UI / UX Behavior

All four modals use `Modal size="md"` (480px) with `modalCardClassName` (min-w-[295px], max-h-[80vh], p-6 md:p-8). Open/close via `useModalStore`. Escape + backdrop click close the top-most modal; when `ConfirmDeleteColumnModal` is stacked, its `onClose` returns to Edit without closing Edit. `DeleteBoardModal` and `ConfirmDeleteColumnModal` titles use `text-[var(--color-red)]`; destructive primary = `variant="destructive"`, Add/Edit = `variant="primary"`.

## Edge Cases & Error Handling

- No columns at submit → Zod `min(1)` on the `columns` path blocks.
- Empty name after trim → blocked by `.min(1)`.
- Stale Zod closure on uniqueness → `.superRefine` reads `useBoardStore.getState().boards` at submit.
- Active board deleted → redirect runs after the store mutation.
- Confirm stacked over Edit → only the top modal listens to Escape.

## Accessibility

`<ModalTitle>` is the first focusable heading per modal; first interactive control receives focus on open. Remove-column and `+ Add New Column` controls expose `aria-label`. Kebab sets `aria-expanded` to match `DropdownMenu.isOpen`; `aria-label="Board menu"`. Delete buttons keep text content. Submit = `<button type="submit">`.
