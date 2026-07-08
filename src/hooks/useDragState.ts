"use client";

import { useDragDropMonitor } from "@dnd-kit/react";
import { useCallback, useState } from "react";

import type { DragStateResult } from "@/lib/dnd/types";

export function useDragState(): DragStateResult {
  const [isDragging, setIsDragging] = useState(false);

  useDragDropMonitor({
    onDragStart: useCallback(() => setIsDragging(true), []),
    onDragEnd: useCallback(() => setIsDragging(false), []),
  });

  return { isDragging };
}
