"use client";

import { useMemo } from "react";
import { Modal } from "@/components/ui/Modal";
import { ModalTitle } from "@/components/ui/ModalTitle";
import { useModalStore } from "@/store/useModalStore";
import { useBoardStore } from "@/features/boards/store/useBoardStore";
import { useTaskStore } from "@/features/tasks/store/useTaskStore";
import { TaskForm, type TaskFormData } from "./TaskForm";
import { cn } from "@/lib/utils";
import { modalCardClassName } from "@/lib/modalCard";

interface EditTaskModalProps {
  taskId: string;
}

export function EditTaskModal({ taskId }: EditTaskModalProps) {
  const closeModal = useModalStore((state) => state.closeModal);
  const task = useTaskStore((state) =>
    state.tasks.find((task) => task.id === taskId)
  );
  const updateTask = useTaskStore((state) => state.updateTask);
  const columns = useBoardStore((state) => state.columns);
  const taskColumn = useMemo(
    () => columns.find((column) => column.id === task?.columnId),
    [columns, task?.columnId]
  );
  const boardColumns = useMemo(
    () =>
      taskColumn
        ? columns
            .filter((column) => column.boardId === taskColumn.boardId)
            .sort((a, b) => a.order - b.order)
        : [],
    [columns, taskColumn]
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

  const handleSubmit = (data: TaskFormData) => {
    const column = boardColumns.find((column) => column.name === data.status);

    const subtasks = data.subtasks.map((subtask) => {
      if (subtask.id) {
        const existingSubtask = task.subtasks.find(
          (existing) => existing.id === subtask.id
        );
        return {
          id: subtask.id,
          title: subtask.title,
          isCompleted: existingSubtask?.isCompleted ?? false,
        };
      }

      return {
        id: crypto.randomUUID(),
        title: subtask.title,
        isCompleted: false,
      };
    });

    const updates: Parameters<typeof updateTask>[1] = {
      title: data.title,
      description: data.description,
      status: data.status,
      subtasks,
    };

    if (column && column.id !== task.columnId) {
      const columnTasks = useTaskStore
        .getState()
        .tasks.filter((task) => task.columnId === column.id);
      const maxOrder =
        columnTasks.length > 0
          ? Math.max(...columnTasks.map((task) => task.order))
          : -1;

      updates.columnId = column.id;
      updates.order = maxOrder + 1;
    }

    updateTask(taskId, updates);
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
