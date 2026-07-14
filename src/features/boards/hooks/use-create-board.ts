"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createBoard } from "@/features/boards/actions";
import { boardKeys } from "@/features/boards/hooks/query-keys";

export function useCreateBoard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: Parameters<typeof createBoard>[0]) => {
      const result = await createBoard(input);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: boardKeys.all });
    },
  });
}
