"use client";

import { useRef, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { useModalStore } from "@/store/useModalStore";
import { useTaskStore } from "@/features/tasks/store/useTaskStore";
import { useBoardStore } from "@/features/boards/store/useBoardStore";
import { TaskNotFound } from "@/features/tasks/components/TaskNotFound";
import { SubtaskCounter } from "@/features/tasks/components/SubtaskCounter";
import { KebabMenuButton } from "@/components/ui/KebabMenuButton";
import { DropdownMenu } from "@/components/ui/DropdownMenu";
import { DropdownMenuItem } from "@/components/ui/DropdownMenuItem";
import { Select } from "@/components/ui/Select";
import { Checkbox } from "@/components/ui/Checkbox";
import { cn } from "@/lib/utils";
import { modalCardClassName } from "@/lib/modalCard";

interface ViewTaskModalProps {
  taskId: string;
}

export function ViewTaskModal({ taskId }: ViewTaskModalProps) {
  const closeModal = useModalStore((state) => state.closeModal);
  const openModal = useModalStore((state) => state.openModal);
  const task = useTaskStore((state) =>
    state.tasks.find((t) => t.id === taskId)
  );
  const toggleSubtask = useTaskStore((state) => state.toggleSubtask);
  const moveTask = useTaskStore((state) => state.moveTask);
  const columns = useBoardStore((state) => state.columns);

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  if (!task) {
    return (
      <Modal
        isOpen
        onClose={closeModal}
        size="md"
        className={cn(modalCardClassName)}
      >
        <TaskNotFound />
      </Modal>
    );
  }

  const completedCount = task.subtasks.filter((s) => s.isCompleted).length;
  const totalCount = task.subtasks.length;

  const currentColumn = columns.find((c) => c.id === task.columnId);
  const statusOptions = columns.filter(
    (c) => c.boardId === currentColumn?.boardId
  );

  const handleEditTask = () => {
    setMenuOpen(false);
    openModal("edit-task", { taskId });
  };

  const handleDeleteTask = () => {
    setMenuOpen(false);
  };

  return (
    <Modal
      isOpen
      onClose={closeModal}
      size="md"
      className={cn(modalCardClassName)}
    >
      <div className="flex items-start justify-between gap-4">
        <h2 className="text-lg font-bold leading-[23px] text-[var(--color-text-primary)]">
          {task.title}
        </h2>

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
                onChange={() => toggleSubtask({ taskId, subtaskId: subtask.id })}
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
        value={task.status}
        onChange={(status) => moveTask(taskId, status)}
        options={statusOptions.map((column) => ({
          value: column.name,
          label: column.name,
        }))}
        className="mt-2"
      />
    </Modal>
  );
}
