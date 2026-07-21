"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import { Modal } from "@/components/ui/Modal";
import { ModalTitle } from "@/components/ui/ModalTitle";
import { Button } from "@/components/ui/Button";
import { useModalStore } from "@/store/useModalStore";
import { useBoardTasks } from "@/features/boards/hooks/use-board-tasks";
import { useDeleteTask } from "@/features/tasks/hooks/use-delete-task";
import { cn } from "@/lib/utils";
import { modalCardClassName } from "@/lib/modalCard";
import { useNotify, messages } from "@/lib/notifications";

interface DeleteTaskModalProps {
  taskId: string;
}

export function DeleteTaskModal({ taskId }: DeleteTaskModalProps) {
  const params = useParams<{ boardId: string }>();
  const boardId = params.boardId;
  const closeModal = useModalStore((state) => state.closeModal);
  const closeAll = useModalStore((state) => state.closeAll);
  const deleteTask = useDeleteTask(boardId);
  const notify = useNotify();
  const { data: tasks } = useBoardTasks(boardId);
  const allTasks = tasks ?? [];

  const task = useMemo(
    () => allTasks.find((t) => t.id === taskId),
    [allTasks, taskId],
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

  const handleDelete = async () => {
    try {
      await deleteTask.mutateAsync(taskId);
      notify.success(messages.task.delete.success);
      closeAll();
    } catch (error) {
      notify.error(messages.task.delete.error);
      console.error("Failed to delete task", error);
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
            loading={deleteTask.isPending}
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
