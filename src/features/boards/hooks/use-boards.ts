"use client";

import { useQuery } from "@tanstack/react-query";
import { boardsQueryOptions } from "@/features/boards/hooks/query-options";

export function useBoards() {
  return useQuery(boardsQueryOptions());
}
