"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import { useBoardTasks } from "@/features/boards/hooks/use-board-tasks";
import { TaskCard } from "./TaskCard";

interface TaskListProps {
  columnId: string;
}

export function TaskList({ columnId }: TaskListProps) {
  const params = useParams<{ boardId: string }>();
  const boardId = params.boardId;
  const { data: allTasks, isError } = useBoardTasks(boardId);

  const tasks = useMemo(
    () =>
      (allTasks ?? [])
        .filter((t) => t.columnId === columnId)
        .toSorted((a, b) => a.order - b.order),
    [allTasks, columnId]
  );

  if (isError) {
    return (
      <p className="text-sm text-[var(--color-red)]">
        Failed to load tasks.
      </p>
    );
  }

  if (tasks.length === 0) {
    return (
      <span className="text-xs italic text-[var(--color-text-secondary)]">
        No tasks
      </span>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {tasks.map((task, index) => (
        <TaskCard key={task.id} task={task} index={index} columnId={columnId} />
      ))}
    </div>
  );
}
