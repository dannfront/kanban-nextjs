"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateBoard } from "@/features/boards/actions";
import { boardKeys } from "@/features/boards/hooks/query-keys";

export function useUpdateBoard(boardId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: Parameters<typeof updateBoard>[1]) => {
      const result = await updateBoard(boardId, input);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: boardKeys.detail(boardId) });
      queryClient.invalidateQueries({ queryKey: boardKeys.all });
    },
  });
}
