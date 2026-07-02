"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface UIState {
  boardMenuOpen: boolean;
  desktopHidden: boolean;
  openBoardMenu: () => void;
  closeBoardMenu: () => void;
  toggleDesktop: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      boardMenuOpen: false,
      desktopHidden: false,
      openBoardMenu: () => set({ boardMenuOpen: true }),
      closeBoardMenu: () => set({ boardMenuOpen: false }),
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
