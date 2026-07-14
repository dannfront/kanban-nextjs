"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateColumn } from "@/features/columns/actions";
import { boardKeys } from "@/features/boards/hooks/query-keys";

export function useUpdateColumn(boardId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      columnId,
      input,
    }: {
      columnId: string;
      input: Parameters<typeof updateColumn>[1];
    }) => {
      const result = await updateColumn(columnId, input);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: boardKeys.detail(boardId) });
    },
  });
}
