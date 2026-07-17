"use client";

import { Button } from "@/components/ui/Button";
import { useModalStore } from "@/store/useModalStore";

export function CreateFirstBoard() {
  const openModal = useModalStore((state) => state.openModal);

  return (
    <div className="flex h-full flex-col items-center justify-center gap-8 px-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">
          Welcome to your Kanban Board
        </h2>
        <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
          You don&apos;t have any boards yet. Create your first board to get started.
        </p>
      </div>
      <Button size="lg" onClick={() => openModal("add-board")}>
        + Create your first board
      </Button>
    </div>
  );
}
