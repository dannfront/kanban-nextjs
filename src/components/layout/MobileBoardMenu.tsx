"use client";

import { Modal } from "@/components/ui/Modal";
import { BoardNavLinks } from "@/features/boards/components/BoardNavLinks";
import { ThemeToggle } from "./ThemeToggle";
import {
  useActiveModal,
  useModalStore,
} from "@/store/useModalStore";
import { useBoards } from "@/features/boards/hooks/use-boards";
import iconBoard from "@/assets/icon-board.svg";

export function MobileBoardMenu() {
  const activeModal = useActiveModal();
  const openModal = useModalStore((state) => state.openModal);
  const closeModal = useModalStore((state) => state.closeModal);
  const { data: boards = [] } = useBoards();

  return (
    <Modal isOpen={activeModal === "mobile-menu"} onClose={closeModal}>
      <div className="py-4">
        <h2 className="mb-5 px-6 text-xs font-bold uppercase tracking-[2.4px] text-[var(--color-medium-gray)]">
          All Boards ({boards.length})
        </h2>

        <BoardNavLinks boards={boards} onNavigate={closeModal} />

        <button
          type="button"
          onClick={() => {
            closeModal();
            openModal("add-board");
          }}
          className="flex w-full items-center gap-4 px-4 py-3.5 text-[0.9375rem] font-bold text-[var(--color-main-purple)] transition-colors hover:text-[var(--color-main-purple-hover)]"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={iconBoard.src} alt="" width={16} height={16} />
          + Create New Board
        </button>

        <div className="mt-4 px-6">
          <ThemeToggle />
        </div>
      </div>
    </Modal>
  );
}
