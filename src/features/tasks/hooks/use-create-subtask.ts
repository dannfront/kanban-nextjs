"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createSubtask } from "@/features/tasks/actions";
import { boardKeys } from "@/features/boards/hooks/query-keys";

export function useCreateSubtask(boardId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: Parameters<typeof createSubtask>[0]) => {
      const result = await createSubtask(input);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: boardKeys.tasks(boardId) });
    },
  });
}
