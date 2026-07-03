import "server-only";

import data from "../../data.json";
import type { Task } from "@/features/tasks/types";

export function getTasksForBoard(boardId: string): Task[] {
  const columnIds = new Set(
    data.columns.filter((c) => c.boardId === boardId).map((c) => c.id)
  );
  return data.tasks
    .filter((t) => columnIds.has(t.columnId))
    .toSorted((a, b) => a.order - b.order);
}
