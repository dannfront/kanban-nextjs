"use client";

import { create } from "zustand";
import type { Column } from "@/features/boards/types";

interface BoardState {
  columns: Column[];
  setColumns: (next: Column[]) => void;
}

export const useBoardStore = create<BoardState>((set) => ({
  columns: [],
  setColumns: (next) => set({ columns: next }),
}));
