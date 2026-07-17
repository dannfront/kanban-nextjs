"use client";

import { cn } from "@/lib/utils";
import { useUIStore } from "@/store/useUIStore";
import { useModalStore } from "@/store/useModalStore";
import { useBoards } from "@/features/boards/hooks/use-boards";
import { ThemeToggle } from "./ThemeToggle";
import { ThemeLogo } from "@/components/ui/ThemeLogo";
import { BoardNavLinks } from "@/features/boards/components/BoardNavLinks";
import { LogoutButton } from "@/features/auth/components/LogoutButton";
import iconBoard from "@/assets/icon-board.svg";
import iconHideSidebar from "@/assets/icon-hide-sidebar.svg";
import iconShowSidebar from "@/assets/icon-show-sidebar.svg";

export function Sidebar() {
  const { desktopHidden, toggleDesktop } = useUIStore();
  const openModal = useModalStore((state) => state.openModal);
  const { data: boards = [] } = useBoards();

  return (
    <>
      <aside
        className={cn(
          "hidden h-screen w-[260px] flex-col bg-[var(--color-bg-sidebar)] md:flex",
          desktopHidden && "md:hidden",
        )}
      >
        <div className="flex h-full flex-col   pt-8">
          <div className="mb-14 hidden px-6 md:block">
            <ThemeLogo />
          </div>

          <h2 className="mb-5 px-6 text-xs font-bold uppercase tracking-[2.4px] text-[var(--color-medium-gray)]">
            All Boards ({boards.length})
          </h2>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <BoardNavLinks boards={boards} />
          </div>

          <button
            type="button"
            onClick={() => openModal("add-board")}
            className="flex items-center gap-4 px-4 py-3.5 text-[0.9375rem] font-bold text-[var(--color-main-purple)] transition-colors hover:text-[var(--color-main-purple-hover)]"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={iconBoard.src} alt="" width={16} height={16} />+ Create
            New Board
          </button>

          <div className="mb-4">
            <ThemeToggle />
          </div>

          <button
            type="button"
            onClick={toggleDesktop}
            className="hidden mx-auto items-center gap-4 px-4 text-[0.9375rem] font-bold text-[var(--color-medium-gray)] transition-colors hover:text-[var(--color-red)] md:flex"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={iconHideSidebar.src} alt="" width={18} height={16} />
            Hide Sidebar
          </button>

          <LogoutButton />
        </div>
      </aside>

      {desktopHidden && (
        <button
          type="button"
          onClick={toggleDesktop}
          className="fixed bottom-8 left-0 z-40 hidden h-12 w-14 items-center justify-center rounded-r-full bg-[var(--color-main-purple)] text-white transition-colors hover:bg-[var(--color-main-purple-hover)] md:flex"
          aria-label="Show sidebar"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={iconShowSidebar.src} alt="" width={16} height={11} />
        </button>
      )}
    </>
  );
}
