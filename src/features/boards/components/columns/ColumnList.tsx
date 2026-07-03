"use client";

import { useBoardStore } from "@/features/boards/store/useBoardStore";
import { Column } from "./Column";
import { NewColumnPlaceholder } from "./NewColumnPlaceholder";

export function ColumnList() {
  const columns = useBoardStore((state) => state.columns);

  return (
    <div className="flex h-full items-start gap-6">
      {columns.map((column) => (
        <Column key={column.id} column={column} />
      ))}
      {columns.length >= 1 ? <NewColumnPlaceholder /> : null}
    </div>
  );
}
