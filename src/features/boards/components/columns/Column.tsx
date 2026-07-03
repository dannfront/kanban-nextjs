import type { Column as ColumnType } from "@/features/boards/types";

interface ColumnProps {
  column: ColumnType;
}

export function Column({ column }: ColumnProps) {
  return (
    <div
      data-column-id={column.id}
      className="flex w-[280px] shrink-0 flex-col rounded-lg bg-[var(--color-bg-card)]"
    >
      <header className="flex h-20 items-center gap-3 px-6">
        <span
          className="inline-block h-[15px] w-[15px] shrink-0 rounded-full"
          style={{ backgroundColor: column.color }}
        />
        <h2 className="text-xs font-bold uppercase tracking-[2.4px] text-[var(--color-medium-gray)]">
          {column.name}
        </h2>
      </header>
      <div className="flex-1" />
    </div>
  );
}
