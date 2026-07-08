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

interface AddTaskModalProps {
  boardId: string;
}

export function AddTaskModal({ boardId }: AddTaskModalProps) {
  const closeModal = useModalStore((state) => state.closeModal);
  const addTask = useTaskStore((state) => state.addTask);
  const allColumns = useBoardStore((state) => state.columns);
  const columns = useMemo(
    () =>
      allColumns
        .filter((column) => column.boardId === boardId)
        .sort((a, b) => a.order - b.order),
    [allColumns, boardId]
  );

  const handleSubmit = (data: TaskFormData) => {
    const column = columns.find((column) => column.name === data.status);
    if (!column) return;

    const columnTasks = useTaskStore
      .getState()
      .tasks.filter((task) => task.columnId === column.id);
    const maxOrder =
      columnTasks.length > 0
        ? Math.max(...columnTasks.map((task) => task.order))
        : -1;

    addTask({
      columnId: column.id,
      title: data.title,
      description: data.description,
      status: data.status,
      order: maxOrder + 1,
      subtasks: data.subtasks.map((subtask) => ({
        id: crypto.randomUUID(),
        title: subtask.title,
        isCompleted: subtask.isCompleted ?? false,
      })),
    });

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
        <ModalTitle>Add New Task</ModalTitle>
        <TaskForm boardId={boardId} mode="create" onSubmit={handleSubmit} />
      </div>
    </Modal>
  );
}
