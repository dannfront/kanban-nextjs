"use client";

import { useDroppableColumn } from "@/lib/dnd";
import { cn } from "@/lib/utils";
import type { Column as ColumnType } from "@/features/boards/types";
import { TaskList } from "@/features/tasks/components/TaskList";

interface ColumnProps {
  column: ColumnType;
}

export function Column({ column }: ColumnProps) {
  const { ref, isDropTarget } = useDroppableColumn({ columnId: column.id });

  return (
    <div
      ref={ref}
      data-column-id={column.id}
      className={cn(
        "flex w-70 shrink-0 flex-col rounded-lg",
        isDropTarget && "ring-2 ring-[var(--color-main-purple)]"
      )}
    >
      <header className="flex h-20 items-center gap-3 px-6">
        <span
          className="inline-block h-3.75 w-3.75 shrink-0 rounded-full"
          style={{ backgroundColor: column.color }}
        />
        <h2 className="text-xs font-bold uppercase tracking-[2.4px] text-[var(--color-medium-gray)]">
          {column.name}
        </h2>
      </header>
      <div className="px-6 pb-6">
        <TaskList columnId={column.id} />
      </div>
    </div>
  );
}
