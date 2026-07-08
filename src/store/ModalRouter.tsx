"use client";

import { useActiveModal, useModalData } from "@/store/useModalStore";
import { AddTaskModal } from "@/features/tasks/components/AddTaskModal";
import { EditTaskModal } from "@/features/tasks/components/EditTaskModal";
import { DeleteTaskModal } from "@/features/tasks/components/DeleteTaskModal";
import { ViewTaskModal } from "@/features/tasks/components/ViewTaskModal";
import { AddBoardModal } from "@/features/boards/components/AddBoardModal";
import { EditBoardModal } from "@/features/boards/components/EditBoardModal";
import { DeleteBoardModal } from "@/features/boards/components/DeleteBoardModal";
import { ConfirmDeleteColumnModal } from "@/features/boards/components/ConfirmDeleteColumnModal";

interface ViewTaskModalData {
  taskId: string;
}

interface AddTaskModalData {
  boardId: string;
}

interface EditTaskModalData {
  taskId: string;
}

interface EditBoardModalData {
  boardId: string;
}

interface DeleteBoardModalData {
  boardId: string;
}

interface ConfirmDeleteColumnModalData {
  boardId: string;
  columnId: string;
  columnName: string;
}

export function ModalRouter() {
  const activeModal = useActiveModal();
  const modalData = useModalData<
    | ViewTaskModalData
    | AddTaskModalData
    | EditTaskModalData
    | EditBoardModalData
    | DeleteBoardModalData
    | ConfirmDeleteColumnModalData
  >();

  switch (activeModal) {
    case "view-task": {
      const data = modalData as ViewTaskModalData | null;
      return data ? <ViewTaskModal taskId={data.taskId} /> : null;
    }
    case "add-task": {
      const data = modalData as AddTaskModalData | null;
      return data ? <AddTaskModal boardId={data.boardId} /> : null;
    }
    case "edit-task": {
      const data = modalData as EditTaskModalData | null;
      return data ? <EditTaskModal taskId={data.taskId} /> : null;
    }
    case "delete-task": {
      const data = modalData as EditTaskModalData | null;
      return data ? <DeleteTaskModal taskId={data.taskId} /> : null;
    }
    case "add-board": {
      return <AddBoardModal />;
    }
    case "edit-board": {
      const data = modalData as EditBoardModalData | null;
      return data ? <EditBoardModal boardId={data.boardId} /> : null;
    }
    case "delete-board": {
      const data = modalData as DeleteBoardModalData | null;
      return data ? <DeleteBoardModal boardId={data.boardId} /> : null;
    }
    case "confirm-delete-column": {
      const data = modalData as ConfirmDeleteColumnModalData | null;
      return data ? (
        <ConfirmDeleteColumnModal
          boardId={data.boardId}
          columnId={data.columnId}
          columnName={data.columnName}
        />
      ) : null;
    }
    default:
      return null;
  }
}
