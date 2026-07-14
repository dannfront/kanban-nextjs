"use client";

import { useMemo } from "react";
import { useBoard } from "@/features/boards/hooks/use-board";

export function useColumnLookup(boardId: string) {
  const { data } = useBoard(boardId);
  const columns = data?.columns ?? [];

  return useMemo(
    () => new Map(columns.map((column) => [column.id, column.name])),
    [columns],
  );
}
