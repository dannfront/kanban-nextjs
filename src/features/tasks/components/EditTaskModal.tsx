"use client";

import { Modal } from "@/components/ui/Modal";
import { ModalTitle } from "@/components/ui/ModalTitle";
import { useModalStore } from "@/store/useModalStore";
import { cn } from "@/lib/utils";
import { modalCardClassName } from "@/lib/modalCard";

interface EditTaskModalProps {
  taskId: string;
}

export function EditTaskModal({ taskId }: EditTaskModalProps) {
  const closeModal = useModalStore((state) => state.closeModal);

  return (
    <Modal
      isOpen
      onClose={closeModal}
      size="md"
      className={cn(modalCardClassName)}
    >
      <div data-task-id={taskId}>
        <ModalTitle>Edit Task</ModalTitle>
        <p className="mt-4 text-[13px] leading-[23px] text-[var(--color-text-secondary)]">
          Form will be implemented in a future update
        </p>
      </div>
    </Modal>
  );
}
