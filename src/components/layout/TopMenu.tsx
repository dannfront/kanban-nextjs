"use client";

import { useParams } from "next/navigation";
import { useUIStore } from "@/store/useUIStore";
import { Button } from "@/components/ui/Button";
import type { Board } from "@/features/boards/types";
import Image from "next/image";
import logoMobile from "@/assets/logo-mobile.svg";
import iconAddTaskMobile from "@/assets/icon-add-task-mobile.svg";
import iconChevronDown from "@/assets/icon-chevron-down.svg";
import iconVerticalEllipsis from "@/assets/icon-vertical-ellipsis.svg";

interface TopMenuProps {
  boards: Board[];
}

export function TopMenu({ boards }: TopMenuProps) {
  const params = useParams<{ boardId?: string }>();
  const boardId = params.boardId;
  const activeBoard = boards.find((board) => board.id === boardId);
  const boardName = activeBoard?.name ?? boardId ?? "";

  const { openBoardMenu } = useUIStore();

  return (
    <header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-[var(--color-lines-dark)] bg-[var(--color-bg-header)] px-4 md:h-24 md:px-6 lg:px-8">
      <div className="flex items-center gap-4 md:hidden">
        <Image src={logoMobile} alt="Kanban" width={24} height={25} />
        <button
          type="button"
          onClick={openBoardMenu}
          className="flex items-center gap-2 text-lg font-bold"
        >
          {boardName}
          <Image src={iconChevronDown} alt="" width={10} height={7} />
        </button>
      </div>

      <h1 className="hidden text-xl font-bold md:block lg:text-2xl">
        {boardName}
      </h1>

      <div className="flex items-center gap-4 md:gap-6">
        <Button size="sm" className="md:hidden" disabled>
          <Image src={iconAddTaskMobile} alt="Add New Task" width={12} height={12} />
        </Button>
        <Button size="lg" className="hidden md:inline-flex" disabled>
          + Add New Task
        </Button>
        <button
          type="button"
          aria-label="Board menu"
          className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-black/10"
        >
          <Image src={iconVerticalEllipsis} alt="" width={5} height={20} />
        </button>
      </div>
    </header>
  );
}
