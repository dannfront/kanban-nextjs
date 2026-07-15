"use client";

import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { boardDetailQueryOptions } from "@/features/boards/hooks/query-options";

export function useBoard(boardId: string) {
  return useQuery({
    ...boardDetailQueryOptions(boardId),
    placeholderData: keepPreviousData,
    enabled: Boolean(boardId),
  });
}
