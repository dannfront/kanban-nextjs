"use client";

import { Modal } from "@/components/ui/Modal";
import { useModalStore } from "@/store/useModalStore";

interface AddTaskModalProps {
  boardId: string;
}

export function AddTaskModal({ boardId }: AddTaskModalProps) {
  const closeModal = useModalStore((state) => state.closeModal);

  return (
    <Modal
      isOpen
      onClose={closeModal}
      size="md"
      className="min-w-[295px] bg-[var(--color-bg-modal)] p-6 md:p-8"
    >
      <div data-board-id={boardId}>
        <h2 className="text-lg font-bold text-[var(--color-text-primary)]">
          Add New Task
        </h2>
        <p className="mt-4 text-[13px] leading-[23px] text-[var(--color-text-secondary)]">
          Form will be implemented in a future update
        </p>
      </div>
    </Modal>
  );
}
