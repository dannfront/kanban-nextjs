"use client";

import { useEffect } from "react";
import { ColumnList } from "./ColumnList";
import { useBoardStore } from "@/features/boards/store/useBoardStore";
import type { Column } from "@/features/boards/types";

interface BoardViewProps {
  initialColumns: Column[];
}

export function BoardView({ initialColumns }: BoardViewProps) {
  const setColumns = useBoardStore((state) => state.setColumns);

  useEffect(() => {
    setColumns(initialColumns);
  }, [initialColumns, setColumns]);

  return (
    <div className="h-full px-6 py-6">
      <ColumnList />
    </div>
  );
}
