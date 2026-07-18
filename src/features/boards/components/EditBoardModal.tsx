"use client";

import { useMemo } from "react";
import { Modal } from "@/components/ui/Modal";
import { ModalTitle } from "@/components/ui/ModalTitle";
import { useModalStore } from "@/store/useModalStore";
import { useBoards } from "@/features/boards/hooks/use-boards";
import { useBoard } from "@/features/boards/hooks/use-board";
import { useBoardTasks } from "@/features/boards/hooks/use-board-tasks";
import { useUpdateBoard } from "@/features/boards/hooks/use-update-board";
import { useDeleteColumn } from "@/features/columns/hooks/use-delete-column";
import {
  BoardFormFields,
  type BoardFormData,
} from "@/features/boards/components/BoardFormFields";
import { cn } from "@/lib/utils";
import { modalCardClassName } from "@/lib/modalCard";
import { useColor } from "@/lib/colors";

interface EditBoardModalProps {
  boardId: string;
}

export function EditBoardModal({ boardId }: EditBoardModalProps) {
  const closeModal = useModalStore((state) => state.closeModal);
  const openModal = useModalStore((state) => state.openModal);
  const { data: boards } = useBoards();
  const allBoards = boards ?? [];
  const { data: boardData } = useBoard(boardId);
  const { data: tasks } = useBoardTasks(boardId);
  const allTasks = tasks ?? [];
  const updateBoard = useUpdateBoard(boardId);
  const deleteColumn = useDeleteColumn(boardId);

  const boardColumns =
    boardData?.columns
      .filter((column) => column.boardId === boardId)
      .sort((a, b) => a.order - b.order) ?? [];

  const board = useMemo(
    () => allBoards.find((b) => b.id === boardId),
    [allBoards, boardId]
  );

  const defaultValues = useMemo(
    () => ({
      name: board?.name ?? "",
      columns: boardColumns.map((column) => ({
        id: column.id,
        name: column.name,
        color: column.color,
      })),
    }),
    [board, boardColumns]
  );

  const colorRepo = useColor();

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

  const handleSubmit = async (data: BoardFormData) => {
    try {
      const columns = data.columns.map((col) => ({
        ...col,
        color: col.color ?? colorRepo.generate(),
      }));

      await updateBoard.mutateAsync({
        name: data.name,
        columns,
      });
      closeModal();
    } catch (error) {
      console.error("Failed to update board", error);
    }
  };

  const handleRemoveColumn = (columnId: string, columnName: string) => {
    const hasTasks = allTasks.some((task) => task.columnId === columnId);

    if (hasTasks) {
      openModal("confirm-delete-column", {
        boardId,
        columnId,
        columnName,
      });
      return;
    }

    deleteColumn.mutate(columnId);
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
          allColumns={boardColumns}
        />
      </div>
    </Modal>
  );
}
