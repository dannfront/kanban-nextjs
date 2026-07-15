import { queryOptions } from "@tanstack/react-query";
import {
  getBoards,
  getBoardWithColumns,
} from "@/features/boards/actions";
import { getTasksWithSubtasks } from "@/features/tasks/actions";
import { boardKeys } from "@/features/boards/hooks/query-keys";

export function boardsQueryOptions() {
  return queryOptions({
    queryKey: boardKeys.all,
    queryFn: async () => {
      const result = await getBoards();
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
  });
}

export function boardDetailQueryOptions(boardId: string) {
  return queryOptions({
    queryKey: boardKeys.detail(boardId),
    queryFn: async () => {
      const result = await getBoardWithColumns(boardId);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
  });
}

export function boardTasksQueryOptions(boardId: string) {
  return queryOptions({
    queryKey: boardKeys.tasks(boardId),
    queryFn: async () => {
      const result = await getTasksWithSubtasks(boardId);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
  });
}
