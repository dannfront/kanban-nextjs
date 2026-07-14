"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createColumn } from "@/features/columns/actions";
import { boardKeys } from "@/features/boards/hooks/query-keys";

export function useCreateColumn(boardId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: { name: string; color: string; order?: number }) => {
      const result = await createColumn({ ...input, boardId });
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: boardKeys.detail(boardId) });
    },
  });
}
