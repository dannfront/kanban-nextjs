"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteSubtask } from "@/features/tasks/actions";
import { boardKeys } from "@/features/boards/hooks/query-keys";

export function useDeleteSubtask(boardId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (subtaskId: string) => {
      const result = await deleteSubtask(subtaskId);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: boardKeys.tasks(boardId) });
    },
  });
}
