"use client";

import { Modal } from "@/components/ui/Modal";
import { useModalStore } from "@/store/useModalStore";

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
      className="min-w-[295px] bg-[var(--color-bg-modal)] p-6 md:p-8"
    >
      <div data-task-id={taskId}>
        <h2 className="text-lg font-bold text-[var(--color-text-primary)]">
          Edit Task
        </h2>
        <p className="mt-4 text-[13px] leading-[23px] text-[var(--color-text-secondary)]">
          Form will be implemented in a future update
        </p>
      </div>
    </Modal>
  );
}
