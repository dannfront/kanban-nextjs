"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { reorderTasksInColumn } from "@/features/tasks/actions";
import { boardKeys } from "@/features/boards/hooks/query-keys";
import type { TaskWithSubtasks } from "@/features/tasks/types";

interface ReorderVars {
  columnId: string;
  orderedTaskIds: string[];
}

export function useReorderTasks(boardId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ columnId, orderedTaskIds }: ReorderVars) => {
      const result = await reorderTasksInColumn(columnId, orderedTaskIds);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },

    onMutate: async ({ columnId, orderedTaskIds }) => {
      await queryClient.cancelQueries({ queryKey: boardKeys.tasks(boardId) });

      const previous = queryClient.getQueryData<TaskWithSubtasks[]>(
        boardKeys.tasks(boardId),
      );

      queryClient.setQueryData<TaskWithSubtasks[]>(
        boardKeys.tasks(boardId),
        (old) => {
          if (!old) return old;

          const orderMap = new Map(
            orderedTaskIds.map((id, index) => [id, index]),
          );

          return old.map((task) => {
            if (task.columnId !== columnId) return task;
            const newOrder = orderMap.get(task.id);
            return newOrder !== undefined ? { ...task, order: newOrder } : task;
          });
        },
      );

      return { previous };
    },

    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(boardKeys.tasks(boardId), context.previous);
      }
      console.error("Failed to reorder tasks. Order restored.");
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: boardKeys.tasks(boardId) });
      queryClient.invalidateQueries({ queryKey: boardKeys.all });
    },
  });
}
