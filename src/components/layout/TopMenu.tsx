"use client";

import { useRef, useState } from "react";
import { useParams } from "next/navigation";
import { useModalStore } from "@/store/useModalStore";
import { useBoards } from "@/features/boards/hooks/use-boards";
import { Button } from "@/components/ui/Button";
import { KebabMenuButton } from "@/components/ui/KebabMenuButton";
import { DropdownMenu } from "@/components/ui/DropdownMenu";
import { DropdownMenuItem } from "@/components/ui/DropdownMenuItem";
import Image from "next/image";
import logoMobile from "@/assets/logo-mobile.svg";
import iconAddTaskMobile from "@/assets/icon-add-task-mobile.svg";
import iconChevronDown from "@/assets/icon-chevron-down.svg";

export function TopMenu() {
  const params = useParams<{ boardId?: string }>();
  const boardId = params.boardId;
  const { data: boards = [] } = useBoards();
  const activeBoard = boards.find((board) => board.id === boardId);
  const boardName = activeBoard?.name ?? boardId ?? "";

  const openModal = useModalStore((state) => state.openModal);

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleAddTask = () => {
    if (!boardId) return;
    openModal("add-task", { boardId });
  };

  const handleEditBoard = () => {
    if (!boardId) return;
    setMenuOpen(false);
    openModal("edit-board", { boardId });
  };

  const handleDeleteBoard = () => {
    if (!boardId) return;
    setMenuOpen(false);
    openModal("delete-board", { boardId });
  };

  return (
    <header className="sticky top-0 z-20 flex h-20 items-center justify-between  border-[var(--color-lines-dark)] bg-[var(--color-bg-header)] px-4 md:h-24 md:px-6 lg:px-8">
      <div className="flex items-center gap-4 md:hidden">
        <Image src={logoMobile} alt="Kanban" width={24} height={25} />
        <button
          type="button"
          onClick={() => openModal("mobile-menu")}
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
        <Button
          size="sm"
          className="md:hidden"
          disabled={!boardId}
          onClick={handleAddTask}
        >
          <Image
            src={iconAddTaskMobile}
            alt="Add New Task"
            width={12}
            height={12}
          />
        </Button>
        <Button
          size="lg"
          className="hidden md:inline-flex"
          disabled={!boardId}
          onClick={handleAddTask}
        >
          + Add New Task
        </Button>

        <div ref={menuRef} className="relative">
          <KebabMenuButton
            ariaLabel="Board menu"
            ariaExpanded={menuOpen}
            onClick={() => setMenuOpen((prev) => !prev)}
          />
          <DropdownMenu
            isOpen={menuOpen}
            onClose={() => setMenuOpen(false)}
            containerRef={menuRef}
          >
            <DropdownMenuItem onClick={handleEditBoard}>
              Edit Board
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleDeleteBoard} variant="destructive">
              Delete Board
            </DropdownMenuItem>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
