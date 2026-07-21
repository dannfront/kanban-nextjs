"use client";

import { useParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useModalStore } from "@/store/useModalStore";

export function EmptyBoard() {
  const params = useParams<{ boardId: string }>();
  const boardId = params.boardId;
  const openModal = useModalStore((state) => state.openModal);

  return (
    <div className="flex h-full flex-col items-center justify-center gap-8 px-4">
      <p className="text-center text-lg font-bold text-[var(--color-medium-gray)]">
        This board is empty. Create a new column to get started.
      </p>
      <Button
        size="lg"
        disabled={!boardId}
        onClick={() => openModal("edit-board", { boardId })}
      >
        + Add New Column
      </Button>
    </div>
  );
}
