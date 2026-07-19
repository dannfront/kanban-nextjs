"use client";

import { useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { Modal } from "@/components/ui/Modal";
import { useModalStore } from "@/store/useModalStore";
import { useBoard } from "@/features/boards/hooks/use-board";
import { useBoardTasks } from "@/features/boards/hooks/use-board-tasks";
import { useToggleSubtask } from "@/features/tasks/hooks/use-toggle-subtask";
import { useMoveTask } from "@/features/tasks/hooks/use-move-task";
import { ViewTaskModalEmpty } from "@/features/tasks/components/ViewTaskModalEmpty";
import { SubtaskCounter } from "@/features/tasks/components/SubtaskCounter";
import { KebabMenuButton } from "@/components/ui/KebabMenuButton";
import { DropdownMenu } from "@/components/ui/DropdownMenu";
import { DropdownMenuItem } from "@/components/ui/DropdownMenuItem";
import { Select } from "@/components/ui/Select";
import { Checkbox } from "@/components/ui/Checkbox";
import { cn } from "@/lib/utils";
import { modalCardClassName } from "@/lib/modalCard";
import { ModalTitle } from "@/components/ui/ModalTitle";

interface ViewTaskModalProps {
  taskId: string;
}

export function ViewTaskModal({ taskId }: ViewTaskModalProps) {
  const params = useParams<{ boardId: string }>();
  const boardId = params.boardId;
  const closeModal = useModalStore((state) => state.closeModal);
  const openModal = useModalStore((state) => state.openModal);
  const { data: tasks } = useBoardTasks(boardId);
  const allTasks = tasks ?? [];
  const { data: boardData } = useBoard(boardId);
  const columns = boardData?.columns ?? [];
  const toggleSubtask = useToggleSubtask(boardId);
  const moveTaskMutation = useMoveTask(boardId);

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const task = useMemo(
    () => allTasks.find((t) => t.id === taskId),
    [allTasks, taskId],
  );

  const statusOptions = useMemo(
    () =>
      columns
        .filter((c) => c.boardId === boardId)
        .sort((a, b) => a.order - b.order)
        .map((column) => ({
          value: column.id,
          label: column.name,
        })),
    [columns, boardId],
  );

  if (!task) {
    return <ViewTaskModalEmpty onClose={closeModal} />;
  }

  const completedCount = task.subtasks.filter((s) => s.isCompleted).length;
  const totalCount = task.subtasks.length;

  const handleEditTask = () => {
    setMenuOpen(false);
    openModal("edit-task", { taskId });
  };

  const handleDeleteTask = () => {
    setMenuOpen(false);
    openModal("delete-task", { taskId });
  };

  const handleStatusChange = (newColumnId: string) => {
    if (newColumnId === task.columnId) return;

    const targetTasks = allTasks.filter(
      (t) => t.columnId === newColumnId && t.id !== taskId,
    );
    const newIndex = targetTasks.length;

    moveTaskMutation.mutate({
      taskId,
      targetColumnId: newColumnId,
      newIndex,
    });
  };

  return (
    <Modal
      isOpen
      onClose={closeModal}
      size="md"
      className={cn(modalCardClassName)}
    >
      <div className="flex items-start justify-between gap-4">
        <ModalTitle className="leading-[23px]">{task.title}</ModalTitle>

        <div ref={menuRef} className="relative shrink-0">
          <KebabMenuButton
            ariaLabel="Task menu"
            ariaExpanded={menuOpen}
            onClick={() => setMenuOpen((prev) => !prev)}
          />
          <DropdownMenu
            isOpen={menuOpen}
            onClose={() => setMenuOpen(false)}
            containerRef={menuRef}
          >
            <DropdownMenuItem onClick={handleEditTask}>
              Edit Task
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleDeleteTask} variant="destructive">
              Delete Task
            </DropdownMenuItem>
          </DropdownMenu>
        </div>
      </div>

      {task.description ? (
        <p className="mt-6 text-[13px] leading-[23px] text-[var(--color-text-secondary)]">
          {task.description}
        </p>
      ) : null}

      <div className="mt-6">
        <SubtaskCounter completed={completedCount} total={totalCount} />

        <div className="mt-4 flex flex-col gap-2">
          {task.subtasks.map((subtask) => (
            <div
              key={subtask.id}
              className="rounded bg-[var(--color-light-gray)] px-3 py-4 transition-colors hover:bg-[var(--color-main-purple)]/25 dark:bg-[var(--color-very-dark)]"
            >
              <Checkbox
                checked={subtask.isCompleted}
                onChange={() => toggleSubtask.mutate(subtask.id)}
                label={subtask.title}
                strikethroughWhenChecked
              />
            </div>
          ))}
        </div>
      </div>

      <Select
        id="task-status"
        label="Current Status"
        value={task.columnId}
        onChange={handleStatusChange}
        options={statusOptions}
        className="mt-2"
      />
    </Modal>
  );
}
