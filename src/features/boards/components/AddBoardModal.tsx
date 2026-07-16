"use client";

import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/Modal";
import { ModalTitle } from "@/components/ui/ModalTitle";
import { useModalStore } from "@/store/useModalStore";
import { useCreateBoard } from "@/features/boards/hooks/use-create-board";
import {
  BoardFormFields,
  type BoardFormData,
} from "@/features/boards/components/BoardFormFields";
import { cn } from "@/lib/utils";
import { modalCardClassName } from "@/lib/modalCard";

// TODO: Remove this hardcoded default color once the column color picker UI is implemented
const DEFAULT_COLUMN_COLOR = "#635FC7";

export function AddBoardModal() {
  const router = useRouter();
  const closeModal = useModalStore((state) => state.closeModal);
  const createBoard = useCreateBoard();

  const handleSubmit = async (data: BoardFormData) => {
    try {
      const columnsWithColor = data.columns.map((col) => ({
        ...col,
        color: col.color ?? DEFAULT_COLUMN_COLOR,
      }));

      const result = await createBoard.mutateAsync({
        name: data.name,
        columns: columnsWithColor,
      });

      router.push(`/kanban-dashboard/${result.id}`);
      closeModal();
    } catch (error) {
      console.error("Failed to create board", error);
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
        <ModalTitle>Add New Board</ModalTitle>
        <BoardFormFields mode="create" onSubmit={handleSubmit} />
      </div>
    </Modal>
  );
}
