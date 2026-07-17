"use client";

import { useParams } from "next/navigation";
import { useBoard } from "@/features/boards/hooks/use-board";
import { useModalStore } from "@/store/useModalStore";
import { Column } from "./Column";
import { NewColumnPlaceholder } from "./NewColumnPlaceholder";

export function ColumnList() {
  const params = useParams<{ boardId: string }>();
  const boardId = params.boardId;
  const { data: boardData, isError } = useBoard(boardId);
  const columns = boardData?.columns ?? [];
  const openModal = useModalStore((state) => state.openModal);

  if (isError) {
    return (
      <p className="text-sm text-[var(--color-red)]">
        Failed to load columns.
      </p>
    );
  }

  return (
    <div className="flex h-full items-start gap-6">
      {columns.map((column) => (
        <Column key={column.id} column={column} />
      ))}
      {columns.length >= 1 ? (
        <NewColumnPlaceholder
          onClick={() => openModal("edit-board", { boardId })}
          aria-label="Add new column"
        />
      ) : null}
    </div>
  );
}
