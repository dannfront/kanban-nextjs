"use client";

import { useMemo } from "react";
import {
  DragDropProvider,
  DragOverlay,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/react";
import { Feedback } from "@dnd-kit/dom";
import type { ReactNode } from "react";

import { keyboardSensor, pointerSensor } from "./sensors";

interface DndProviderProps {
  children: ReactNode;
  onDragStart?: (event: DragStartEvent) => void;
  onDragOver?: (event: DragOverEvent) => void;
  onDragEnd?: (event: DragEndEvent) => void;
}

export function DndProvider({
  children,
  onDragStart,
  onDragOver,
  onDragEnd,
}: DndProviderProps) {
  // Memoize sensors so DragDropProvider does not re-initialize on every render.
  const sensors = useMemo(() => [pointerSensor, keyboardSensor], []);

  // Disable the Feedback drop animation to avoid double-animation / DOM snap
  // conflicts when React re-renders after the Zustand state update.
  const plugins = useMemo(
    () => (defaults: any[]) => [
      ...defaults,
      Feedback.configure({ dropAnimation: null }),
    ],
    []
  );

  return (
    <DragDropProvider
      sensors={sensors}
      plugins={plugins}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
    >
      {children}
      <DragOverlay>
        {(source) =>
          source ? (
            <div className="pointer-events-none w-[280px] rounded-lg bg-[var(--color-bg-card)] px-4 py-[23px] opacity-90 shadow-xl">
              <span className="text-[15px] font-bold text-[var(--color-text-primary)]">
                {source.data?.title ?? String(source.id)}
              </span>
            </div>
          ) : null
        }
      </DragOverlay>
    </DragDropProvider>
  );
}
