"use client";

import { useMemo } from "react";
import { Modal } from "@/components/ui/Modal";
import { ModalTitle } from "@/components/ui/ModalTitle";
import { Button } from "@/components/ui/Button";
import { useModalStore } from "@/store/useModalStore";
import { useBoardTasks } from "@/features/boards/hooks/use-board-tasks";
import { useDeleteColumn } from "@/features/columns/hooks/use-delete-column";
import { cn } from "@/lib/utils";
import { modalCardClassName } from "@/lib/modalCard";
import { useNotify, messages } from "@/lib/notifications";

interface ConfirmDeleteColumnModalProps {
  boardId: string;
  columnId: string;
  columnName: string;
}

export function ConfirmDeleteColumnModal({
  boardId,
  columnId,
  columnName,
}: ConfirmDeleteColumnModalProps) {
  const closeModal = useModalStore((state) => state.closeModal);
  const deleteColumn = useDeleteColumn(boardId);
  const notify = useNotify();
  const { data: tasks } = useBoardTasks(boardId);
  const allTasks = tasks ?? [];

  const count = useMemo(
    () => allTasks.filter((task) => task.columnId === columnId).length,
    [allTasks, columnId]
  );

  const taskLabel = useMemo(() => {
    return `${count} task${count === 1 ? "" : "s"}`;
  }, [count]);

  const handleDelete = async () => {
    try {
      await deleteColumn.mutateAsync(columnId);
      closeModal();
    } catch {
      notify.error(messages.column.delete.error);
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
          Delete this column?
        </ModalTitle>
        <p className="text-[13px] leading-[23px] text-[var(--color-text-secondary)]">
          Are you sure you want to delete the &apos;{columnName}&apos; column?
          It contains {taskLabel}. This action cannot be reversed.
        </p>
        <div className="flex gap-4">
          <Button
            variant="destructive"
            size="sm"
            className="w-full"
            onClick={handleDelete}
            loading={deleteColumn.isPending}
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
