"use client";

import { Modal } from "@/components/ui/Modal";
import { ModalTitle } from "@/components/ui/ModalTitle";
import { useModalStore } from "@/store/useModalStore";
import { useCreateTask } from "@/features/tasks/hooks/use-create-task";
import { TaskForm, type TaskFormData } from "./TaskForm";
import { cn } from "@/lib/utils";
import { modalCardClassName } from "@/lib/modalCard";
import { useNotify, messages } from "@/lib/notifications";

interface AddTaskModalProps {
  boardId: string;
}

export function AddTaskModal({ boardId }: AddTaskModalProps) {
  const closeModal = useModalStore((state) => state.closeModal);
  const createTask = useCreateTask(boardId);
  const notify = useNotify();

  const handleSubmit = async (data: TaskFormData) => {
    try {
      await createTask.mutateAsync({
        columnId: data.columnId,
        title: data.title,
        description: data.description,
        subtasks: data.subtasks
          .filter((s) => s.title.trim().length > 0)
          .map((subtask) => ({
            title: subtask.title,
          })),
      });
      notify.success(messages.task.create.success);
      closeModal();
    } catch (error) {
      notify.error(messages.task.create.error);
      console.error("Failed to create task", error);
    }
  };

  return (
    <Modal
      isOpen
      onClose={closeModal}
      size="md"
      className={cn(modalCardClassName)}
    >
      <div className="space-y-6">
        <ModalTitle>Add New Task</ModalTitle>
        <TaskForm boardId={boardId} mode="create" onSubmit={handleSubmit} />
      </div>
    </Modal>
  );
}
