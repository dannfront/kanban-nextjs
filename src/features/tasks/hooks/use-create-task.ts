"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createTask } from "@/features/tasks/actions";
import { boardKeys } from "@/features/boards/hooks/query-keys";

export function useCreateTask(boardId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: Parameters<typeof createTask>[0]) => {
      const result = await createTask(input);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: boardKeys.tasks(boardId) });
      queryClient.invalidateQueries({ queryKey: boardKeys.all });
    },
  });
}
