"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { useBoards } from "@/features/boards/hooks/use-boards";
import { useModalStore } from "@/store/useModalStore";
import type { Board } from "@/features/boards/types";
import iconBoard from "@/assets/icon-board.svg";

interface BoardNavLinksProps {
  boards?: Board[];
  onNavigate?: () => void;
}

export function BoardNavLinks({ boards: fallbackBoards, onNavigate }: BoardNavLinksProps) {
  const params = useParams<{ boardId?: string }>();
  const boardId = params.boardId;
  const { data: queryBoards } = useBoards();
  const openModal = useModalStore((state) => state.openModal);

  // Use query cache boards when available (populated by SSR HydrationBoundary),
  // fall back to prop for SSR/initial render edge cases
  const boards = queryBoards && queryBoards.length > 0 ? queryBoards : fallbackBoards ?? [];

  return (
    <nav>
      {boards.map((board) => {
        const isActive = board.id === boardId;
        return (
          <Link
            key={board.id}
            href={`/kanban-dashboard/${board.id}`}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-4 px-4 py-3.5 text-[0.9375rem] font-bold transition-colors w-[85%]",
              isActive
                ? "bg-[var(--color-main-purple)] text-white rounded-r-full"
                : "text-[var(--color-medium-gray)] hover:bg-white/10 hover:text-[var(--color-main-purple)] rounded-r-full"
            )}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={iconBoard.src}
              alt=""
              width={16}
              height={16}
              className={cn(isActive && "brightness-0 invert")}
            />
            {board.name}
          </Link>
        );
      })}
      <button
        type="button"
        onClick={() => openModal("add-board")}
        className="flex w-full items-center gap-4 px-4 py-3.5 text-[0.9375rem] font-bold text-[var(--color-main-purple)] transition-colors hover:text-[var(--color-main-purple-hover)]"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={iconBoard.src} alt="" width={16} height={16} />
        + Create New Board
      </button>
    </nav>
  );
}
