"use client";

import { Modal } from "@/components/ui/Modal";
import { ModalTitle } from "@/components/ui/ModalTitle";
import { Button } from "@/components/ui/Button";
import { useModalStore } from "@/store/useModalStore";
import { useTaskStore } from "@/features/tasks/store/useTaskStore";
import { cn } from "@/lib/utils";
import { modalCardClassName } from "@/lib/modalCard";

interface DeleteTaskModalProps {
  taskId: string;
}

export function DeleteTaskModal({ taskId }: DeleteTaskModalProps) {
  const closeModal = useModalStore((state) => state.closeModal);
  const deleteTask = useTaskStore((state) => state.deleteTask);
  const task = useTaskStore((state) =>
    state.tasks.find((t) => t.id === taskId)
  );

  if (!task) {
    return (
      <Modal
        isOpen
        onClose={closeModal}
        size="md"
        className={cn(modalCardClassName)}
      >
        <ModalTitle>Task not found</ModalTitle>
      </Modal>
    );
  }

  const handleDelete = () => {
    deleteTask(taskId);
    closeModal();
  };

  return (
    <Modal
      isOpen
      onClose={closeModal}
      size="md"
      className={cn(modalCardClassName)}
    >
      <div className="space-y-6">
        <ModalTitle className="text-[var(--color-red)]">
          Delete this task?
        </ModalTitle>
        <p className="text-[13px] leading-[23px] text-[var(--color-text-secondary)]">
          Are you sure you want to delete the &apos;{task.title}&apos; task and
          its subtasks? This action cannot be reversed.
        </p>
        <div className="flex gap-4">
          <Button
            variant="destructive"
            size="sm"
            className="w-full"
            onClick={handleDelete}
          >
            Delete
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className="w-full dark:bg-white dark:text-[var(--color-main-purple)]"
            onClick={closeModal}
          >
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  );
}
