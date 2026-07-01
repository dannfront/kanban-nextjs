"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface UIState {
  boardMenuOpen: boolean;
  desktopHidden: boolean;
  openBoardMenu: () => void;
  closeBoardMenu: () => void;
  toggleBoardMenu: () => void;
  toggleDesktop: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      boardMenuOpen: false,
      desktopHidden: false,
      openBoardMenu: () => set({ boardMenuOpen: true }),
      closeBoardMenu: () => set({ boardMenuOpen: false }),
      toggleBoardMenu: () =>
        set((state) => ({ boardMenuOpen: !state.boardMenuOpen })),
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
