"use client";

import { useBoard } from "@/features/boards/hooks/use-board";
import { useBoardTasks } from "@/features/boards/hooks/use-board-tasks";
import { EmptyBoard } from "@/features/boards/components/EmptyBoard";
import { BoardView } from "@/features/boards/components/columns/BoardView";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

interface BoardPageContentProps {
  boardId: string;
}

export function BoardPageContent({ boardId }: BoardPageContentProps) {
  const { data: boardData, isLoading, isError } = useBoard(boardId);
  useBoardTasks(boardId);

  if (isLoading) return <LoadingSpinner />;
  if (isError || !boardData) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 px-4">
        <p className="text-lg font-bold text-[var(--color-red)]">
          Board not found
        </p>
        <p className="text-sm text-[var(--color-medium-gray)]">
          This board may have been deleted or does not exist.
        </p>
      </div>
    );
  }

  if (!boardData.columns?.length) {
    return <EmptyBoard />;
  }

  return <BoardView boardId={boardId} />;
}
