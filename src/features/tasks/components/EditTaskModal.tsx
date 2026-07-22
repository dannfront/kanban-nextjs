"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import { Modal } from "@/components/ui/Modal";
import { ModalTitle } from "@/components/ui/ModalTitle";
import { useModalStore } from "@/store/useModalStore";
import { useBoard } from "@/features/boards/hooks/use-board";
import { useTask } from "@/features/boards/hooks/use-task";
import { useUpdateTask } from "@/features/tasks/hooks/use-update-task";
import { TaskForm, type TaskFormData } from "./TaskForm";
import { cn } from "@/lib/utils";
import { modalCardClassName } from "@/lib/modalCard";
import { useNotify, messages } from "@/lib/notifications";

interface EditTaskModalProps {
  taskId: string;
}

export function EditTaskModal({ taskId }: EditTaskModalProps) {
  const params = useParams<{ boardId: string }>();
  const boardId = params.boardId;
  const closeModal = useModalStore((state) => state.closeModal);
  const task = useTask(boardId, taskId);
  const { data: boardData } = useBoard(boardId);
  const columns = boardData?.columns ?? [];
  const updateTask = useUpdateTask(boardId);
  const notify = useNotify();

  const taskColumn = useMemo(
    () => columns.find((column) => column.id === task?.columnId),
    [columns, task?.columnId],
  );
  const boardColumns = useMemo(
    () =>
      taskColumn
        ? columns
            .filter((column) => column.boardId === taskColumn.boardId)
            .sort((a, b) => a.order - b.order)
        : [],
    [columns, taskColumn],
  );

  if (!task || !taskColumn) {
    return (
      <Modal
        isOpen
        onClose={closeModal}
        size="md"
        className={cn(modalCardClassName)}
      >
        <p className="text-[13px] leading-[23px] text-[var(--color-text-secondary)]">
          Task not found
        </p>
      </Modal>
    );
  }

  const handleSubmit = async (data: TaskFormData) => {
    const subtasks = data.subtasks
      .filter((s) => (s.id && s.isDeleted) || s.title.trim().length > 0)
      .map((subtask) => ({
        ...(subtask.id ? { id: subtask.id } : {}),
        title: subtask.title,
        ...(subtask.isDeleted ? { isDeleted: true } : {}),
      }));

    const input: {
      title?: string;
      description?: string;
      columnId?: string;
      subtasks?: { id?: string; title: string; isDeleted?: boolean }[];
    } = {
      title: data.title,
      description: data.description,
      subtasks,
    };

    if (data.columnId !== task.columnId) {
      input.columnId = data.columnId;
    }

    try {
      await updateTask.mutateAsync({ taskId, input });
      closeModal();
    } catch {
      notify.error(messages.task.update.error);
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
        <ModalTitle>Edit Task</ModalTitle>
        <TaskForm
          boardId={taskColumn.boardId}
          mode="edit"
          defaultValues={task}
          onSubmit={handleSubmit}
        />
      </div>
    </Modal>
  );
}
