"use client";

import { useQuery } from "@tanstack/react-query";
import { getBoardWithColumns } from "@/features/boards/actions";
import { boardKeys } from "@/features/boards/hooks/query-keys";

export function useBoard(boardId: string) {
  return useQuery({
    queryKey: boardKeys.detail(boardId),
    queryFn: async () => {
      const result = await getBoardWithColumns(boardId);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    enabled: Boolean(boardId),
  });
}
