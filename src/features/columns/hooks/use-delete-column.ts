"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteColumn } from "@/features/columns/actions";
import { boardKeys } from "@/features/boards/hooks/query-keys";

export function useDeleteColumn(boardId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (columnId: string) => {
      const result = await deleteColumn(columnId);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: boardKeys.detail(boardId) });
    },
  });
}
