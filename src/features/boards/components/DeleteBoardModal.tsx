"use client";

import { useParams, useRouter } from "next/navigation";
import { useMemo } from "react";
import { Modal } from "@/components/ui/Modal";
import { ModalTitle } from "@/components/ui/ModalTitle";
import { Button } from "@/components/ui/Button";
import { useModalStore } from "@/store/useModalStore";
import { useBoardStore } from "@/features/boards/store/useBoardStore";
import { cn } from "@/lib/utils";
import { modalCardClassName } from "@/lib/modalCard";

interface DeleteBoardModalProps {
  boardId: string;
}

export function DeleteBoardModal({ boardId }: DeleteBoardModalProps) {
  const router = useRouter();
  const params = useParams<{ boardId?: string }>();
  const closeModal = useModalStore((state) => state.closeModal);
  const deleteBoard = useBoardStore((state) => state.deleteBoard);
  const allBoards = useBoardStore((state) => state.boards);

  const board = useMemo(
    () => allBoards.find((b) => b.id === boardId),
    [allBoards, boardId]
  );

  if (!board) {
    return (
      <Modal
        isOpen
        onClose={closeModal}
        size="md"
        className={cn(modalCardClassName)}
      >
        <ModalTitle>Board not found</ModalTitle>
      </Modal>
    );
  }

  const handleDelete = () => {
    deleteBoard(boardId);

    if (params.boardId === boardId) {
      const remainingBoards = allBoards.filter((b) => b.id !== boardId);
      const nextBoard = remainingBoards[0];
      router.push(nextBoard ? `/kanban-dashboard/${nextBoard.id}` : "/");
    }

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
        <ModalTitle className="text-[var(--color-red)]">
          Delete this board?
        </ModalTitle>
        <p className="text-[13px] leading-[23px] text-[var(--color-text-secondary)]">
          Are you sure you want to delete the &apos;{board.name}&apos; board?
          This action will remove all columns and tasks and cannot be reversed.
        </p>
        <div className="flex gap-4">
          <Button
            variant="destructive"
            size="sm"
            className="w-full"
            onClick={handleDelete}
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
