"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toggleSubtask } from "@/features/tasks/actions";
import { boardKeys } from "@/features/boards/hooks/query-keys";
import type { TaskWithSubtasks } from "@/features/tasks/types";

export function useToggleSubtask(boardId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (subtaskId: string) => {
      const result = await toggleSubtask(subtaskId);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    onMutate: async (subtaskId: string) => {
      await queryClient.cancelQueries({ queryKey: boardKeys.tasks(boardId) });

      const previous = queryClient.getQueryData<TaskWithSubtasks[]>(
        boardKeys.tasks(boardId),
      );

      queryClient.setQueryData<TaskWithSubtasks[]>(
        boardKeys.tasks(boardId),
        (old) =>
          old?.map((t) => ({
            ...t,
            subtasks: t.subtasks.map((s) =>
              s.id === subtaskId ? { ...s, isCompleted: !s.isCompleted } : s,
            ),
          })),
      );

      return { previous };
    },
    onError: (_err, _subtaskId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(boardKeys.tasks(boardId), context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: boardKeys.tasks(boardId) });
    },
  });
}
