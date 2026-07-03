"use client";

import { Modal } from "@/components/ui/Modal";
import { BoardNavLinks } from "@/features/boards/components/BoardNavLinks";
import { ThemeToggle } from "./ThemeToggle";
import {
  useActiveModal,
  useModalStore,
} from "@/store/useModalStore";
import type { Board } from "@/features/boards/types";

interface MobileBoardMenuProps {
  boards: Board[];
}

export function MobileBoardMenu({ boards }: MobileBoardMenuProps) {
  const activeModal = useActiveModal();
  const closeModal = useModalStore((state) => state.closeModal);

  return (
    <Modal isOpen={activeModal === "mobile-menu"} onClose={closeModal}>
      <div className="py-4">
        <h2 className="mb-5 px-6 text-xs font-bold uppercase tracking-[2.4px] text-[var(--color-medium-gray)]">
          All Boards ({boards.length})
        </h2>

        <BoardNavLinks boards={boards} onNavigate={closeModal} />

        <div className="mt-4 px-6">
          <ThemeToggle />
        </div>
      </div>
    </Modal>
  );
}
