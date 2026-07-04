"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Modal } from "@/components/ui/Modal";
import { useModalStore } from "@/store/useModalStore";
import { useTaskStore } from "@/features/tasks/store/useTaskStore";
import { useBoardStore } from "@/features/boards/store/useBoardStore";
import { TaskNotFound } from "@/features/tasks/components/TaskNotFound";
import { SubtaskCounter } from "@/features/tasks/components/SubtaskCounter";
import { KebabMenuButton } from "@/components/ui/KebabMenuButton";
import { DropdownMenu } from "@/components/ui/DropdownMenu";
import { DropdownMenuItem } from "@/components/ui/DropdownMenuItem";
import { cn } from "@/lib/utils";
import { modalCardClassName } from "@/lib/modalCard";
import iconCheck from "@/assets/icon-check.svg";

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

  const handleSubtaskToggle = (subtaskId: string) => {
    toggleSubtask({ taskId, subtaskId });
  };

  const handleStatusChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    moveTask(taskId, event.target.value);
  };

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
            <label
              key={subtask.id}
              className="flex cursor-pointer items-center gap-4 rounded bg-[var(--color-light-gray)] px-3 py-4 transition-colors hover:bg-[var(--color-main-purple)]/25 dark:bg-[var(--color-very-dark)]"
            >
              <span className="relative flex h-4 w-4 shrink-0 items-center justify-center rounded border border-[var(--color-medium-gray)]/25 bg-white transition-colors has-[:checked]:border-[var(--color-main-purple)] has-[:checked]:bg-[var(--color-main-purple)] dark:bg-[var(--color-dark-gray-2)]">
                <input
                  type="checkbox"
                  checked={subtask.isCompleted}
                  onChange={() => handleSubtaskToggle(subtask.id)}
                  className="peer sr-only"
                />
                <Image
                  src={iconCheck}
                  alt=""
                  width={10}
                  height={8}
                  className="pointer-events-none opacity-0 transition-opacity peer-checked:opacity-100"
                />
              </span>
              <span
                className={`text-xs font-bold transition-colors ${
                  subtask.isCompleted
                    ? "text-[var(--color-medium-gray)] line-through"
                    : "text-[var(--color-text-primary)]"
                }`}
              >
                {subtask.title}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <label
          htmlFor="task-status"
          className="text-xs font-bold text-[var(--color-text-secondary)]"
        >
          Current Status
        </label>
        <div className="relative mt-2">
          <select
            id="task-status"
            value={task.status}
            onChange={handleStatusChange}
            className="w-full appearance-none rounded border border-[var(--color-lines-dark)]/25 bg-transparent px-4 py-2 text-[13px] font-medium text-[var(--color-text-primary)] outline-none focus:border-[var(--color-main-purple)]"
          >
            {statusOptions.map((column) => (
              <option key={column.id} value={column.name}>
                {column.name}
              </option>
            ))}
          </select>
          <span className="pointer-events-none absolute right-4 top-1/2 h-2 w-2 -translate-y-1/2 rotate-45 border-b-2 border-r-2 border-[var(--color-main-purple)]" />
        </div>
      </div>
    </Modal>
  );
}
