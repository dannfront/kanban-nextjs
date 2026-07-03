"use client";

import { useMemo } from "react";
import { useTaskStore } from "@/features/tasks/store/useTaskStore";
import { TaskCard } from "./TaskCard";

interface TaskListProps {
  columnId: string;
}

export function TaskList({ columnId }: TaskListProps) {
  const allTasks = useTaskStore((s) => s.tasks);

  const tasks = useMemo(
    () =>
      allTasks
        .filter((t) => t.columnId === columnId)
        .toSorted((a, b) => a.order - b.order),
    [allTasks, columnId]
  );

  if (tasks.length === 0) {
    return (
      <span className="text-xs italic text-[var(--color-text-secondary)]">
        No tasks
      </span>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {tasks.map((task) => (
        <TaskCard key={task.id} task={task} />
      ))}
    </div>
  );
}
