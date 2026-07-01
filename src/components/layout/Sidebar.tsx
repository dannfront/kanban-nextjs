"use client";

import { cn } from "@/lib/utils";
import { useUIStore } from "@/store/useUIStore";
import { ThemeToggle } from "./ThemeToggle";
import { ThemeLogo } from "@/components/ui/ThemeLogo";
import { BoardNavLinks } from "@/features/boards/components/BoardNavLinks";
import type { Board } from "@/features/boards/types";
import iconHideSidebar from "@/assets/icon-hide-sidebar.svg";
import iconShowSidebar from "@/assets/icon-show-sidebar.svg";

interface SidebarProps {
  boards: Board[];
}

export function Sidebar({ boards }: SidebarProps) {
  const { desktopHidden, toggleDesktop } = useUIStore();

  return (
    <>
      <aside
        className={cn(
          "hidden h-screen w-[260px] flex-col bg-[var(--color-bg-sidebar)] md:flex",
          desktopHidden && "md:hidden"
        )}
      >
        <div className="flex h-full flex-col pb-8 pt-8">
          <div className="mb-14 hidden px-6 md:block">
            <ThemeLogo />
          </div>

          <div className="flex-1 overflow-y-auto">
            <h2 className="mb-5 px-6 text-xs font-bold uppercase tracking-[2.4px] text-[var(--color-medium-gray)]">
              All Boards ({boards.length})
            </h2>
            <BoardNavLinks boards={boards} />
          </div>

          <div className="mb-4">
            <ThemeToggle />
          </div>

          <button
            type="button"
            onClick={toggleDesktop}
            className="hidden items-center gap-4 px-4 text-[0.9375rem] font-bold text-[var(--color-medium-gray)] transition-colors hover:text-[var(--color-red)] md:flex"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={iconHideSidebar.src} alt="" width={18} height={16} />
            Hide Sidebar
          </button>
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
