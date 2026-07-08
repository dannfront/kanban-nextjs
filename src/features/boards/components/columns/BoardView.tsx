"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { ColumnList } from "./ColumnList";
import { useBoardStore } from "@/features/boards/store/useBoardStore";
import { useTaskStore } from "@/features/tasks/store/useTaskStore";
import {
  DndProvider,
  isSortable,
  move,
  type DragEndEvent,
  type DragOverEvent,
} from "@/lib/dnd";
import type { Column } from "@/features/boards/types";
import type { Task } from "@/features/tasks/types";

interface BoardViewProps {
  initialColumns: Column[];
  initialTasks: Task[];
}

export function BoardView({ initialColumns, initialTasks }: BoardViewProps) {
  const columns = useBoardStore((state) => state.columns);
  const setColumns = useBoardStore((state) => state.setColumns);
  const tasks = useTaskStore((state) => state.tasks);
  const setTasks = useTaskStore((state) => state.setTasks);

  useEffect(() => {
    setColumns(initialColumns);
  }, [initialColumns, setColumns]);

  useEffect(() => {
    setTasks(initialTasks);
  }, [initialTasks, setTasks]);

  const tasksByColumn = useMemo(() => {
    const grouped: Record<string, string[]> = {};

    for (const column of columns) {
      grouped[column.id] = [];
    }

    const orderByTaskId = new Map(tasks.map((task) => [task.id, task.order]));

    for (const task of tasks) {
      if (!grouped[task.columnId]) {
        grouped[task.columnId] = [];
      }
      grouped[task.columnId].push(task.id);
    }

    for (const columnId of Object.keys(grouped)) {
      grouped[columnId].sort(
        (a, b) => (orderByTaskId.get(a) ?? 0) - (orderByTaskId.get(b) ?? 0)
      );
    }

    return grouped;
  }, [columns, tasks]);

  const tasksByColumnSnapshot = useRef<Record<string, string[]>>({});
  const columnNameById = useMemo(
    () => new Map(columns.map((column) => [column.id, column.name])),
    [columns]
  );

  const handleDragStart = useCallback(() => {
    // Deep clone so the snapshot is isolated from future re-renders.
    tasksByColumnSnapshot.current = structuredClone(tasksByColumn);
  }, [tasksByColumn]);

  // Prevent OptimisticSortingPlugin from moving DOM nodes directly.
  // This avoids "removeChild" and "useInsertionEffect" errors caused by
  // dnd-kit manipulating the DOM outside of React's control.
  // DragOverlay inside DndProvider provides visual feedback instead.
  const handleDragOver = useCallback((event: DragOverEvent) => {
    event.preventDefault();
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      if (event.canceled) return;

      const source = event.operation.source;
      if (!isSortable(source)) return;

      const { group } = source;
      if (!group) return;

      const reordered = move(tasksByColumnSnapshot.current, event);

      const newPositions = new Map<
        string,
        { columnId: string; order: number; status: string }
      >();

      for (const [columnId, ids] of Object.entries(reordered)) {
        const status = columnNameById.get(columnId) ?? "";
        ids.forEach((id, index) => {
          newPositions.set(String(id), {
            columnId,
            order: index,
            status,
          });
        });
      }

      const nextTasks = tasks.map((task) => {
        const next = newPositions.get(task.id);
        if (!next) return task;
        if (
          next.columnId === task.columnId &&
          next.order === task.order &&
          next.status === task.status
        ) {
          return task;
        }
        return { ...task, ...next };
      });

      setTasks(nextTasks);
    },
    [columnNameById, setTasks, tasks]
  );

  return (
    <DndProvider
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="h-full px-6 py-6">
        <ColumnList />
      </div>
    </DndProvider>
  );
}
