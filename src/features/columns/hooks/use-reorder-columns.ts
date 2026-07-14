"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { reorderColumns } from "@/features/columns/actions";
import { boardKeys } from "@/features/boards/hooks/query-keys";

export function useReorderColumns(boardId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderedColumnIds: string[]) => {
      const result = await reorderColumns(boardId, orderedColumnIds);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: boardKeys.detail(boardId) });
    },
  });
}
