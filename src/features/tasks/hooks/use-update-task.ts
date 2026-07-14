"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateTask } from "@/features/tasks/actions";
import { boardKeys } from "@/features/boards/hooks/query-keys";

export function useUpdateTask(boardId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      taskId,
      input,
    }: {
      taskId: string;
      input: Parameters<typeof updateTask>[1];
    }) => {
      const result = await updateTask(taskId, input);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: boardKeys.tasks(boardId) });
      queryClient.invalidateQueries({ queryKey: boardKeys.detail(boardId) });
    },
  });
}
