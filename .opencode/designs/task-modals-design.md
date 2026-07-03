# Design: Task Modals (View full + Add/Edit shells)

## Technical Approach

- New client `ModalRouter` in `src/store/ModalRouter.tsx` switch-dispatches on `useActiveModal()`. Mounted once in `DashboardShell` (the actual layout wrapping the `(dashboard)` route group — `src/app/(dashboard)/layout.tsx` does not exist).
- `ViewTaskModal` fully implemented: read display, subtask checkboxes, status dropdown, ellipsis menu.
- `AddTaskModal` and `EditTaskModal` are EXPLICIT SHELLS — heading + empty placeholder. No form fields, no submit. Honors the user's NO-FORM constraint; form UI is a future change.
- `useTaskStore` extended additively with `toggleSubtask({ taskId, subtaskId })` and `moveTask(taskId, newStatus)`. `addTask`/`updateTask` OUT OF SCOPE.
- `TaskCard` onClick opens `view-task`. `TopMenu` "+ Add New Task" opens `add-task`.

## Architecture Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Dispatch | Single `ModalRouter` in `DashboardShell` | One mount, survives route changes |
| `moveTask` board lookup | `useBoardStore.getState().columns` inside the action | Clean signature `(taskId, newStatus)`; canonical Zustand imperative read |
| Status → column resolution | Match `column.name === newStatus` within same `boardId` | Supports non-standard boards (e.g., "Now/Next/Later" on board-003) |
| Ellipsis close | Local `useState` + `document.mousedown` listener scoped to ref | One consumer, no premature `useClickOutside` |
| Status UI | Native `<select>` styled with CSS vars | Free a11y; design needs visual hierarchy only |
| Add/Edit content | Heading + placeholder "Form will be implemented in a future update" | Makes shell intent obvious |
| Close UX | Reuse `Modal`'s built-in Escape + overlay-click | Already exercised by `MobileBoardMenu` |

## Data Flow

```
TaskCard onClick ──► openModal('view-task', { taskId })
                          │
                          ▼
            ModalRouter switch ──► ViewTaskModal
                          │
       ┌──────────────────┴──────────────────┐
       ▼                                     ▼
 checkbox ──► toggleSubtask                status <select> ──► moveTask(id, newStatus)
   │            └─► setTasks(immutable)            │
   │                                               ▼
   │                                  useBoardStore.getState().columns
   │                                  find col.name === newStatus
   │                                  AND col.boardId === current.boardId
   │                                  update task.status + task.columnId
   └──────────────────────────► BoardView re-renders ◄──────────┘
```

TopMenu → `openModal('add-task', { boardId })` → `AddTaskModal` shell. Ellipsis "Edit Task" → `openModal('edit-task', { taskId })` → `EditTaskModal` shell. "Delete Task" → `setMenuOpen(false)` only.

## File Changes

| File | Action | Description |
|---|---|---|
| `src/store/ModalRouter.tsx` | Create | `"use client"` switch dispatcher; `null` for unknown |
| `src/features/tasks/components/ViewTaskModal.tsx` | Create | Full read modal |
| `src/features/tasks/components/AddTaskModal.tsx` | Create | Shell only |
| `src/features/tasks/components/EditTaskModal.tsx` | Create | Shell only |
| `src/features/tasks/store/useTaskStore.ts` | Modify | Add `toggleSubtask`, `moveTask`; keep `setTasks` |
| `src/features/tasks/components/TaskCard.tsx` | Modify | `onClick` + `cursor-pointer` + `role="button"` + Enter/Space handler |
| `src/components/layout/TopMenu.tsx` | Modify | Remove `disabled`; onClick → `openModal('add-task', { boardId })` |
| `src/components/layout/DashboardShell.tsx` | Modify | Render `<ModalRouter />` once |

No new form components, no new hooks, no new `ModalType` union members.

## Interfaces / Contracts

```ts
// useTaskStore (additive)
interface TaskState {
  tasks: Task[];
  setTasks: (next: Task[]) => void;
  toggleSubtask: (args: { taskId: string; subtaskId: string }) => void;
  moveTask: (taskId: string, newStatus: string) => void;
}
// toggleSubtask: map subtasks, flip isCompleted, set new array
// moveTask: cur = columns.find(c => c.id === task.columnId)
//           tgt = columns.find(c => c.boardId === cur.boardId
//                                  && c.name === newStatus)
//           if found: { status: newStatus, columnId: tgt.id, ...task }

interface ViewTaskModalProps { taskId: string }
interface AddTaskModalProps  { boardId: string }
interface EditTaskModalProps { taskId: string }
```

CSS vars from `globals.css`: `--color-bg-modal`, `--color-text-primary`, `--color-text-secondary`, `--color-main-purple`, `--color-medium-gray`, `--color-red`. No new tokens.

## Testing Strategy

| Layer | What | Approach |
|---|---|---|
| Unit | `toggleSubtask`, `moveTask` | `tsc --noEmit` + manual happy-path |
| Visual | ViewTaskModal render | Manual, light + dark, 1440px + 375px |
| Interaction | Checkbox flip, status move, ellipsis Edit/Delete | Manual |
| Integration | TaskCard → View; TopMenu → Add shell | Manual |
| Regression | `setTasks` hydration; no double-modal mount | Manual sequence |

No test runner; verification = `tsc --noEmit` + click-through.

## Migration / Rollout

None. Rollback = revert the single commit. New store actions are additive.

## Open Questions

- Ellipsis clipping? Not at 480px; revisit with a portal only if needed.
- Custom status popover? Native `<select>` is the simplest baseline; swap in a follow-up if design demands.

## NO-FORM Boundary (explicit)

User mandated: NO `TaskFormFields`, NO inputs/textareas/dynamic subtask form, NO `addTask`/`updateTask`. Add/Edit are SHELLS rendering only modal chrome + static placeholder. Enforced in three places: (1) `useTaskStore` extension is the ONLY store change — no mutation actions; (2) Add/Edit components have no `useState`/form state; (3) `ModalRouter` routes to them as named shells, so the future form change plugs in without touching the router.
