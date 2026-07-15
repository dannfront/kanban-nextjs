"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toggleSubtask } from "@/features/tasks/actions";
import { boardKeys } from "@/features/boards/hooks/query-keys";

export function useToggleSubtask(boardId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (subtaskId: string) => {
      const result = await toggleSubtask(subtaskId);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: boardKeys.tasks(boardId) });
      queryClient.invalidateQueries({ queryKey: boardKeys.all });
    },
  });
}
