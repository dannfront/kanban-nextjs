"use client";

import { useUIStore } from "@/store/useUIStore";
import { cn } from "@/lib/utils";
import { Sidebar } from "./Sidebar";
import { TopMenu } from "./TopMenu";
import { MobileBoardMenu } from "./MobileBoardMenu";
import { ModalRouter } from "@/store/ModalRouter";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const desktopHidden = useUIStore((state) => state.desktopHidden);

  return (
    <div
      className={cn(
        "grid h-full overflow-hidden grid-cols-1 grid-rows-1",
        !desktopHidden && "md:grid-cols-[260px_1fr]"
      )}
    >
      <Sidebar />
      <MobileBoardMenu />
      <div className="flex min-w-0 flex-col">
        <TopMenu />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
      <ModalRouter />
    </div>
  );
}
