"use client";

import { Modal } from "@/components/ui/Modal";
import { TaskNotFound } from "@/features/tasks/components/TaskNotFound";
import { cn } from "@/lib/utils";
import { modalCardClassName } from "@/lib/modalCard";

interface ViewTaskModalEmptyProps {
  onClose: () => void;
}

export function ViewTaskModalEmpty({ onClose }: ViewTaskModalEmptyProps) {
  return (
    <Modal isOpen onClose={onClose} size="md" className={cn(modalCardClassName)}>
      <TaskNotFound />
    </Modal>
  );
}
