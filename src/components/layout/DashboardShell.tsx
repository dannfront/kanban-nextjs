"use client";

import { useUIStore } from "@/store/useUIStore";
import { cn } from "@/lib/utils";
import { Sidebar } from "./Sidebar";
import { TopMenu } from "./TopMenu";
import { MobileBoardMenu } from "./MobileBoardMenu";
import type { Board } from "@/features/boards/types";

interface DashboardShellProps {
  boards: Board[];
  children: React.ReactNode;
}

export function DashboardShell({ boards, children }: DashboardShellProps) {
  const desktopHidden = useUIStore((state) => state.desktopHidden);

  return (
    <div
      className={cn(
        "grid h-full overflow-hidden grid-cols-1 grid-rows-1",
        !desktopHidden && "md:grid-cols-[260px_1fr]"
      )}
    >
      <Sidebar boards={boards} />
      <MobileBoardMenu boards={boards} />
      <div className="flex min-w-0 flex-col">
        <TopMenu boards={boards} />
        <main className="flex-1 overflow-x-auto overflow-y-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
