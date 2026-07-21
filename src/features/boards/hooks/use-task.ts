"use client";

import { useMemo } from "react";
import { useBoardTasks } from "@/features/boards/hooks/use-board-tasks";
import type { TaskWithSubtasks } from "@/features/tasks/types";

/**
 * Returns a single task by id, memoized on tasks + taskId.
 * Returns undefined if the task does not exist or the query is still loading.
 */
export function useTask(
  boardId: string,
  taskId: string,
): TaskWithSubtasks | undefined {
  const { data: tasks } = useBoardTasks(boardId);

  return useMemo(
    () => (tasks ?? []).find((t) => t.id === taskId),
    [tasks, taskId],
  );
}
