"use client";

import { useQuery } from "@tanstack/react-query";
import { getBoards } from "@/features/boards/actions";
import { boardKeys } from "@/features/boards/hooks/query-keys";

export function useBoards() {
  return useQuery({
    queryKey: boardKeys.all,
    queryFn: async () => {
      const result = await getBoards();
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
  });
}
