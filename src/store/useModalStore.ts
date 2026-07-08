"use client";

import { create } from "zustand";

export type ModalType =
  | "mobile-menu"
  | "add-board"
  | "edit-board"
  | "delete-board"
  | "confirm-delete-column"
  | "add-task"
  | "edit-task"
  | "delete-task"
  | "view-task";

interface ModalEntry {
  type: ModalType;
  data: unknown;
}

interface ModalState {
  stack: ModalEntry[];
  openModal: (type: ModalType, data?: unknown) => void;
  closeModal: () => void;
}

export const useModalStore = create<ModalState>()((set) => ({
  stack: [],
  openModal: (type, data = null) =>
    set((state) => ({
      stack: [...state.stack, { type, data }],
    })),
  closeModal: () =>
    set((state) => ({
      stack: state.stack.slice(0, -1),
    })),
}));

export const useActiveModal = () =>
  useModalStore((state) => state.stack[state.stack.length - 1]?.type ?? null);

export const useModalData = <T = unknown>() =>
  useModalStore(
    (state) => (state.stack[state.stack.length - 1]?.data as T | null) ?? null
  );
