"use client";

import { CollisionPriority } from "@dnd-kit/abstract";
import { useDroppable } from "@dnd-kit/react";

import type { DroppableColumnResult } from "../types";

interface UseDroppableColumnOptions {
  columnId: string;
}

export function useDroppableColumn({
  columnId,
}: UseDroppableColumnOptions): DroppableColumnResult {
  const { ref, isDropTarget } = useDroppable({
    id: columnId,
    type: "task",
    collisionPriority: CollisionPriority.Low,
  });

  return { ref, isDropTarget };
}
