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

    onMutate: async (orderedColumnIds) => {
      await queryClient.cancelQueries({
        queryKey: boardKeys.detail(boardId),
      });

      const previous = queryClient.getQueryData(boardKeys.detail(boardId));

      queryClient.setQueryData(boardKeys.detail(boardId), (old) => {
        if (!old || typeof old !== "object" || !("columns" in old)) return old;
        const board = old as { columns: { id: string }[] };
        const orderMap = new Map(
          orderedColumnIds.map((id, i) => [id, i]),
        );
        return {
          ...board,
          columns: [...board.columns].sort(
            (a, b) =>
              (orderMap.get(a.id) ?? 0) - (orderMap.get(b.id) ?? 0),
          ),
        };
      });

      return { previous };
    },

    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(boardKeys.detail(boardId), context.previous);
      }
      console.error("Failed to reorder columns. Order restored.");
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: boardKeys.detail(boardId) });
    },
  });
}
