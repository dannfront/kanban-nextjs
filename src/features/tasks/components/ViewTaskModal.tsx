"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Modal } from "@/components/ui/Modal";
import { useModalStore } from "@/store/useModalStore";
import { useTaskStore } from "@/features/tasks/store/useTaskStore";
import { useBoardStore } from "@/features/boards/store/useBoardStore";
import iconVerticalEllipsis from "@/assets/icon-vertical-ellipsis.svg";
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

  useEffect(() => {
    if (!menuOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  if (!task) {
    return (
      <Modal
        isOpen
        onClose={closeModal}
        size="md"
        className="min-w-[295px] bg-[var(--color-bg-modal)] p-6 md:p-8"
      >
        <p className="text-[13px] leading-[23px] text-[var(--color-text-secondary)]">
          Task not found
        </p>
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
      className="min-w-[295px] bg-[var(--color-bg-modal)] p-6 md:p-8"
    >
      <div className="flex items-start justify-between gap-4">
        <h2 className="text-lg font-bold leading-[23px] text-[var(--color-text-primary)]">
          {task.title}
        </h2>

        <div ref={menuRef} className="relative shrink-0">
          <button
            type="button"
            aria-label="Task menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((prev) => !prev)}
            className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-black/10"
          >
            <Image src={iconVerticalEllipsis} alt="" width={5} height={20} />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-10 z-10 w-40 rounded-lg bg-[var(--color-bg-modal)] py-2 shadow-[0_4px_6px_rgba(0,0,0,0.1)] ring-1 ring-[var(--color-lines-dark)]">
              <button
                type="button"
                onClick={handleEditTask}
                className="w-full px-4 py-2 text-left text-[13px] font-medium text-[var(--color-medium-gray)] transition-colors hover:bg-black/5"
              >
                Edit Task
              </button>
              <button
                type="button"
                onClick={handleDeleteTask}
                className="w-full px-4 py-2 text-left text-[13px] font-medium text-[var(--color-red)] transition-colors hover:bg-black/5"
              >
                Delete Task
              </button>
            </div>
          )}
        </div>
      </div>

      {task.description ? (
        <p className="mt-6 text-[13px] leading-[23px] text-[var(--color-text-secondary)]">
          {task.description}
        </p>
      ) : null}

      <div className="mt-6">
        <p className="text-xs font-bold text-[var(--color-text-secondary)]">
          Subtasks ({completedCount} of {totalCount})
        </p>

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
