"use client";

import { useCallback, useMemo, useRef } from "react";
import { useParams } from "next/navigation";
import { ColumnList } from "./ColumnList";
import { useBoard } from "@/features/boards/hooks/use-board";
import { useBoardTasks } from "@/features/boards/hooks/use-board-tasks";
import { useMoveTask } from "@/features/tasks/hooks/use-move-task";
import { useReorderTasks } from "@/features/tasks/hooks/use-reorder-tasks";
import {
  DndProvider,
  isSortable,
  move,
  type DragEndEvent,
  type DragOverEvent,
} from "@/lib/dnd";

function arraysEqual(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((val, idx) => val === b[idx]);
}

export function BoardView() {
  const params = useParams<{ boardId: string }>();
  const boardId = params.boardId;

  const { data: boardData } = useBoard(boardId);
  const columns = boardData?.columns ?? [];

  const { data: tasks } = useBoardTasks(boardId);
  const allTasks = tasks ?? [];

  const moveTaskMutation = useMoveTask(boardId);
  const reorderTasksMutation = useReorderTasks(boardId);

  const tasksByColumn = useMemo(() => {
    const grouped: Record<string, string[]> = {};

    for (const column of columns) {
      grouped[column.id] = [];
    }

    const orderByTaskId = new Map(allTasks.map((task) => [task.id, task.order]));

    for (const task of allTasks) {
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
  }, [columns, allTasks]);

  const tasksByColumnSnapshot = useRef<Record<string, string[]>>({});

  const handleDragStart = useCallback(() => {
    tasksByColumnSnapshot.current = structuredClone(tasksByColumn);
  }, [tasksByColumn]);

  // Prevent OptimisticSortingPlugin from moving DOM nodes directly.
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

      const taskId = String(source.id);
      const sourceColumnId = String(group);

      const reordered = move(tasksByColumnSnapshot.current, event);

      // Find where the dragged task ended up
      let targetColumnId: string | undefined;
      let newIndex = -1;
      for (const [colId, ids] of Object.entries(reordered)) {
        const idx = ids.indexOf(taskId);
        if (idx !== -1) {
          targetColumnId = colId;
          newIndex = idx;
          break;
        }
      }

      if (!targetColumnId) return;

      if (targetColumnId !== sourceColumnId) {
        // Cross-column move — useMoveTask handles optimistic update + invalidation
        moveTaskMutation.mutate({ taskId, targetColumnId, newIndex });
      } else {
        // Same-column reorder — only fire if order actually changed
        const snapshotIds = tasksByColumnSnapshot.current[sourceColumnId];
        const newIds = reordered[sourceColumnId];
        if (snapshotIds && newIds && !arraysEqual(snapshotIds, newIds)) {
          reorderTasksMutation.mutate({
            columnId: sourceColumnId,
            orderedTaskIds: newIds,
          });
        }
      }
    },
    [moveTaskMutation, reorderTasksMutation]
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
