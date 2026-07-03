"use client";

import { create } from "zustand";

export type ModalType =
  | "mobile-menu"
  | "add-board"
  | "edit-board"
  | "delete-board"
  | "add-task"
  | "edit-task"
  | "delete-task"
  | "view-task";

interface ModalState {
  activeModal: ModalType | null;
  modalData: unknown;
  openModal: (type: ModalType, data?: unknown) => void;
  closeModal: () => void;
}

export const useModalStore = create<ModalState>()((set) => ({
  activeModal: null,
  modalData: null,
  openModal: (type, data = null) => set({ activeModal: type, modalData: data }),
  closeModal: () => set({ activeModal: null, modalData: null }),
}));

export const useActiveModal = () => useModalStore((state) => state.activeModal);

export const useModalData = <T = unknown>() =>
  useModalStore((state) => state.modalData as T | null);
