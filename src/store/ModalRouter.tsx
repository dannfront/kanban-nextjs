"use client";

import { useActiveModal, useModalData } from "@/store/useModalStore";
import { AddTaskModal } from "@/features/tasks/components/AddTaskModal";
import { EditTaskModal } from "@/features/tasks/components/EditTaskModal";
import { ViewTaskModal } from "@/features/tasks/components/ViewTaskModal";

interface ViewTaskModalData {
  taskId: string;
}

interface AddTaskModalData {
  boardId: string;
}

interface EditTaskModalData {
  taskId: string;
}

export function ModalRouter() {
  const activeModal = useActiveModal();
  const modalData = useModalData<
    ViewTaskModalData | AddTaskModalData | EditTaskModalData
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
    default:
      return null;
  }
}
