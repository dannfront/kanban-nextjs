"use client";

import { useQuery } from "@tanstack/react-query";
import { getTasksWithSubtasks } from "@/features/tasks/actions";
import { boardKeys } from "@/features/boards/hooks/query-keys";

export function useBoardTasks(boardId: string) {
  return useQuery({
    queryKey: boardKeys.tasks(boardId),
    queryFn: async () => {
      const result = await getTasksWithSubtasks(boardId);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    enabled: Boolean(boardId),
  });
}
