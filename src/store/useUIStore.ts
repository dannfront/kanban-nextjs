"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type SidebarMobile = "open" | "closed";

interface UIState {
  mobile: SidebarMobile;
  desktopHidden: boolean;
  setMobile: (value: SidebarMobile) => void;
  toggleMobile: () => void;
  toggleDesktop: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      mobile: "closed",
      desktopHidden: false,
      setMobile: (value) => set({ mobile: value }),
      toggleMobile: () =>
        set((state) => ({
          mobile: state.mobile === "open" ? "closed" : "open",
        })),
      toggleDesktop: () =>
        set((state) => ({ desktopHidden: !state.desktopHidden })),
    }),
    {
      name: "kanban-ui",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
    }
  )
);
