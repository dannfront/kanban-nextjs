"use client";

import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { boardTasksQueryOptions } from "@/features/boards/hooks/query-options";

export function useBoardTasks(boardId: string) {
  return useQuery({
    ...boardTasksQueryOptions(boardId),
    placeholderData: keepPreviousData,
    enabled: Boolean(boardId),
  });
}
