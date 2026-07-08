"use client";

import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/Modal";
import { ModalTitle } from "@/components/ui/ModalTitle";
import { useModalStore } from "@/store/useModalStore";
import { useBoardStore } from "@/features/boards/store/useBoardStore";
import {
  BoardFormFields,
  type BoardFormData,
} from "@/features/boards/components/BoardFormFields";
import { cn } from "@/lib/utils";
import { modalCardClassName } from "@/lib/modalCard";

export function AddBoardModal() {
  const router = useRouter();
  const closeModal = useModalStore((state) => state.closeModal);
  const addBoard = useBoardStore((state) => state.addBoard);

  const handleSubmit = (data: BoardFormData) => {
    const boardId = addBoard({
      name: data.name,
      columns: data.columns,
    });

    router.push(`/kanban-dashboard/${boardId}`);
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
        <ModalTitle>Add New Board</ModalTitle>
        <BoardFormFields mode="create" onSubmit={handleSubmit} />
      </div>
    </Modal>
  );
}
