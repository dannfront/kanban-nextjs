"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface UIState {
  desktopHidden: boolean;
  toggleDesktop: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      desktopHidden: false,
      toggleDesktop: () =>
        set((state) => ({ desktopHidden: !state.desktopHidden })),
    }),
    {
      name: "kanban-ui",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: (state) => ({ desktopHidden: state.desktopHidden }),
    }
  )
);
