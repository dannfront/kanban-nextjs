"use client";

import { useMemo } from "react";
import { useBoardTasks } from "@/features/boards/hooks/use-board-tasks";
import type { TaskWithSubtasks } from "@/features/tasks/types";

/**
 * Returns tasks belonging to a specific column, memoized on tasks + columnId.
 * Returns [] while the board tasks query is still loading.
 */
export function useColumnTasks(
  boardId: string,
  columnId: string,
): TaskWithSubtasks[] {
  const { data: tasks } = useBoardTasks(boardId);

  return useMemo(
    () => (tasks ?? []).filter((t) => t.columnId === columnId),
    [tasks, columnId],
  );
}
