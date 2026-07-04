"use client";

import { useModalStore } from "@/store/useModalStore";
import { SubtaskCounter } from "@/features/tasks/components/SubtaskCounter";
import type { Task } from "@/features/tasks/types";

interface TaskCardProps {
  task: Task;
}

export function TaskCard({ task }: TaskCardProps) {
  const openModal = useModalStore((state) => state.openModal);
  const completed = task.subtasks.filter((s) => s.isCompleted).length;
  const total = task.subtasks.length;

  const handleClick = () => {
    openModal("view-task", { taskId: task.id });
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleClick();
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className="w-full cursor-pointer rounded-lg bg-[var(--color-bg-card)] px-4 py-[23px] hover:shadow-[0_4px_6px_rgba(0,0,0,0.05)]"
    >
      <h3 className="text-[15px] font-bold leading-[19px] text-[var(--color-text-primary)] line-clamp-2">
        {task.title}
      </h3>
      <div className="mt-2">
        <SubtaskCounter
          completed={completed}
          total={total}
          variant="sentence"
        />
      </div>
    </div>
  );
}
