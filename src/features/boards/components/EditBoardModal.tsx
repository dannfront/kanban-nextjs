"use client";

import { useMemo } from "react";
import { Modal } from "@/components/ui/Modal";
import { ModalTitle } from "@/components/ui/ModalTitle";
import { useModalStore } from "@/store/useModalStore";
import { useBoardStore } from "@/features/boards/store/useBoardStore";
import { useTaskStore } from "@/features/tasks/store/useTaskStore";
import {
  BoardFormFields,
  type BoardFormData,
} from "@/features/boards/components/BoardFormFields";
import { cn } from "@/lib/utils";
import { modalCardClassName } from "@/lib/modalCard";

interface EditBoardModalProps {
  boardId: string;
}

export function EditBoardModal({ boardId }: EditBoardModalProps) {
  const closeModal = useModalStore((state) => state.closeModal);
  const openModal = useModalStore((state) => state.openModal);
  const allBoards = useBoardStore((state) => state.boards);
  const allColumns = useBoardStore((state) => state.columns);
  const updateBoard = useBoardStore((state) => state.updateBoard);
  const deleteColumn = useBoardStore((state) => state.deleteColumn);

  const board = useMemo(
    () => allBoards.find((b) => b.id === boardId),
    [allBoards, boardId]
  );

  const boardColumns = useMemo(
    () =>
      allColumns
        .filter((column) => column.boardId === boardId)
        .sort((a, b) => a.order - b.order),
    [allColumns, boardId]
  );

  const defaultValues = useMemo(
    () => ({
      name: board?.name ?? "",
      columns: boardColumns.map((column) => ({
        id: column.id,
        name: column.name,
      })),
    }),
    [board, boardColumns]
  );

  if (!board) {
    return (
      <Modal
        isOpen
        onClose={closeModal}
        size="md"
        className={cn(modalCardClassName)}
      >
        <p className="text-[13px] leading-[23px] text-[var(--color-text-secondary)]">
          Board not found
        </p>
      </Modal>
    );
  }

  const handleSubmit = (data: BoardFormData) => {
    updateBoard(boardId, {
      name: data.name,
      columns: data.columns,
    });
    closeModal();
  };

  const handleRemoveColumn = (columnId: string, columnName: string) => {
    const hasTasks = useTaskStore
      .getState()
      .tasks.some((task) => task.columnId === columnId);

    if (hasTasks) {
      openModal("confirm-delete-column", {
        boardId,
        columnId,
        columnName,
      });
      return;
    }

    deleteColumn(boardId, columnId);
  };

  return (
    <Modal
      isOpen
      onClose={closeModal}
      size="md"
      className={cn(modalCardClassName)}
    >
      <div className="space-y-6">
        <ModalTitle>Edit Board</ModalTitle>
        <BoardFormFields
          mode="edit"
          defaultValues={defaultValues}
          excludeBoardId={boardId}
          onRemoveColumn={handleRemoveColumn}
          onSubmit={handleSubmit}
        />
      </div>
    </Modal>
  );
}
