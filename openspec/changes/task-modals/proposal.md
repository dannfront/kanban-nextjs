# Proposal: Task Modals (View / Add / Edit)

## Intent

The board renders columns and task cards but has no way to read details, create a task, or edit one. `useModalStore` already declares `view-task | add-task | edit-task` types, and design references exist in `diseño/full-design/`, but no consumer components do. This change ships the three modals so the user can complete the core read/write loop (view → edit/add) from a single board view.

## Scope

### In Scope
- `ViewTaskModal` — read-only: title, description, subtasks with checkboxes, "Current Status" dropdown (mutates status), ellipsis dropdown with **Edit Task** + **Delete Task** (Delete is a no-op stub for a future change).
- `AddTaskModal` — form: title, description, dynamic subtask list with remove, **+ Add New Subtask**, status select, **Create Task**.
- `EditTaskModal` — same form pre-filled, **Save Changes** button.
- Shared `TaskFormFields` component reused by Add + Edit.
- `useTaskStore` extension: `addTask`, `updateTask`, `toggleSubtask`, `moveTask` (moveTask is needed by View's status dropdown).
- `TaskCard` onClick → opens `view-task` with task payload.
- `TopMenu` "+ Add New Task" → opens `add-task` with current board id.
- 480px desktop / 295px mobile, light + dark.

### Out of Scope
- `DeleteTaskModal` (deferred — design already exists).
- Persistence beyond `useTaskStore` (no server writes, no localStorage).
- Drag-and-drop, column management, board switching from inside modals.

## Capabilities

### New Capabilities
- `task-modals`: view, add, and edit task modals driven by `useModalStore`, mutations scoped to client-side `useTaskStore`.

### Modified Capabilities
- None — `Task` and `Subtask` types reused as-is.

## Approach

- All modals are client components using the existing `Modal` primitive at `size="md"` (480px) with a `min-w-[295px]` class for mobile.
- `ModalRouter` in `src/store/` reads `useActiveModal()` and renders the right modal; mounted once in the dashboard layout.
- `useTaskStore` gains pure-function actions returning new arrays (immutable update). `toggleSubtask` flips one subtask's `isCompleted`.
- View's status dropdown binds to `updateTask({ id, status })`; subtask checkboxes call `toggleSubtask({ taskId, subtaskId })`.
- `TaskFormFields` is a controlled `value` + `onChange` component. Light validation: title required, non-empty.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/store/ModalRouter.tsx` | New | Dispatches active modal to component. |
| `src/features/tasks/components/{View,Add,Edit}TaskModal.tsx` | New | The three modals. |
| `src/features/tasks/components/TaskFormFields.tsx` | New | Shared form layout. |
| `src/features/tasks/components/TaskCard.tsx` | Modified | onClick → opens `view-task`. |
| `src/components/layout/TopMenu.tsx` | Modified | Wires "+ Add New Task" to `add-task`. |
| `src/app/(dashboard)/layout.tsx` | Modified | Mounts `ModalRouter` once. |
| `src/features/tasks/store/useTaskStore.ts` | Modified | Adds `addTask`, `updateTask`, `toggleSubtask`, `moveTask`. |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| SSR/hydration mismatch on modal open | Med | Client components, render `null` until `isOpen` after hydration. |
| Subtask form losing focus on re-render | Med | Stable `id` keys on subtask inputs; never recreate the list per keystroke. |
| `useTaskStore` changes break BoardView | Low | New actions are additive; keep `setTasks`. |
| Status dropdown re-renders the whole column | Low | Selector returns the task by id. |

## First-Slice Boundary

Add and Edit share `TaskFormFields` — splitting forces duplicating ~80% of the form. View is read-only but its ellipsis opens Edit. **Ship all three in one slice**, ordered: store actions → `TaskFormFields` → Add + Edit modals → View modal + click handlers. Delete is the next change.

## Rollback Plan

- Revert the commit that mounts `ModalRouter`; modals become unreachable. New store actions are additive and safe to leave in place. No data migration, no schema change.

## Dependencies

- `src/components/ui/Modal.tsx`, `src/store/useModalStore.ts`, `src/features/tasks/types.ts`, design references in `diseño/full-design/`.

## Success Criteria

- [ ] Clicking `TaskCard` opens `ViewTaskModal` with the right task.
- [ ] Toggling a subtask persists in `useTaskStore` and reflects in the column.
- [ ] Changing "Current Status" moves the task to the right column.
- [ ] "+ Add New Task" opens `AddTaskModal`; submit adds the task in the selected column.
- [ ] Ellipsis → "Edit Task" opens `EditTaskModal` prefilled; save updates it.
- [ ] All three modals render at 480px desktop and ≥295px mobile in both themes.
- [ ] Escape and backdrop click close every modal.
