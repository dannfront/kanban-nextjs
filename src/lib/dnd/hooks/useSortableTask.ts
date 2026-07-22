"use client";

import { useSortable } from "@dnd-kit/react/sortable";

import type { SortableTaskResult } from "../types";

interface UseSortableTaskOptions {
  taskId: string;
  index: number;
  columnId: string;
  title: string;
}

export function useSortableTask({
  taskId,
  index,
  columnId,
  title,
}: UseSortableTaskOptions): SortableTaskResult {
  const { ref, isDragging, handleRef, isDropTarget } = useSortable({
    id: taskId,
    index,
    group: columnId,
    type: "task",
    accept: "task",
    data: { title },
  });

  return { ref, isDragging, handleRef, isDropTarget };
}
