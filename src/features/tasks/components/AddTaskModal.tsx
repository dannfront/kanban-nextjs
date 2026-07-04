"use client";

import { Modal } from "@/components/ui/Modal";
import { ModalTitle } from "@/components/ui/ModalTitle";
import { useModalStore } from "@/store/useModalStore";
import { cn } from "@/lib/utils";
import { modalCardClassName } from "@/lib/modalCard";

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
      className={cn(modalCardClassName)}
    >
      <div data-board-id={boardId}>
        <ModalTitle>Add New Task</ModalTitle>
        <p className="mt-4 text-[13px] leading-[23px] text-[var(--color-text-secondary)]">
          Form will be implemented in a future update
        </p>
      </div>
    </Modal>
  );
}
