"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteBoard } from "@/features/boards/actions";
import { boardKeys } from "@/features/boards/hooks/query-keys";

export function useDeleteBoard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (boardId: string) => {
      const result = await deleteBoard(boardId);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: boardKeys.all });
    },
  });
}
