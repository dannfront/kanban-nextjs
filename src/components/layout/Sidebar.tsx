"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/store/useUIStore";
import { ThemeToggle } from "./ThemeToggle";
import type { Board } from "@/features/boards/types";
import logoLight from "@/assets/logo-light.svg";
import logoDark from "@/assets/logo-dark.svg";
import iconBoard from "@/assets/icon-board.svg";
import iconHideSidebar from "@/assets/icon-hide-sidebar.svg";
import iconShowSidebar from "@/assets/icon-show-sidebar.svg";

interface SidebarProps {
  boards: Board[];
}

function ThemeLogo() {
  const { resolvedTheme } = useTheme();
  const logoSrc = resolvedTheme === "light" ? logoDark.src : logoLight.src;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={logoSrc}
      alt="Kanban"
      width={153}
      height={26}
      className="h-[26px] w-[153px]"
    />
  );
}

export function Sidebar({ boards }: SidebarProps) {
  const params = useParams<{ boardId?: string }>();
  const boardId = params.boardId;
  const { mobile, desktopHidden, setMobile, toggleDesktop } = useUIStore();

  const isMobileOpen = mobile === "open";

  const closeMobile = () => setMobile("closed");

  return (
    <>
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-[260px] transform bg-[var(--color-bg-sidebar)] transition-transform duration-200 md:static md:translate-x-0",
          isMobileOpen ? "translate-x-0" : "-translate-x-full",
          desktopHidden && "md:hidden"
        )}
      >
        <div className="flex h-full flex-col pb-8 pt-8">
          <div className="mb-14 px-6 hidden md:block">
            <ThemeLogo />
          </div>

          <div className="flex-1 overflow-y-auto">
            <h2 className="mb-5 px-6 text-xs font-bold uppercase tracking-[2.4px] text-[var(--color-medium-gray)]">
              All Boards ({boards.length})
            </h2>
            <nav className="">
              {boards.map((board) => {
                const isActive = board.id === boardId;
                return (
                  <Link
                    key={board.id}
                    href={`/kanban-dashboard/${board.id}`}
                    onClick={closeMobile}
                    className={cn(
                      "flex items-center gap-4  px-4 py-3.5 text-[0.9375rem] font-bold transition-colors w-full",
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
                disabled
                className="flex w-full cursor-not-allowed items-center gap-4 px-4 py-3.5 text-[0.9375rem] font-bold text-[var(--color-main-purple)] opacity-50"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={iconBoard.src} alt="" width={16} height={16} />
                + Create New Board
              </button>
            </nav>
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

      {isMobileOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={closeMobile}
        />
      )}

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
