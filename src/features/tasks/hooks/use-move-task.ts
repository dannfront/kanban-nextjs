"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { moveTask } from "@/features/tasks/actions";
import { boardKeys } from "@/features/boards/hooks/query-keys";
import type { TaskWithSubtasks } from "@/features/tasks/types";

interface MoveTaskVars {
  taskId: string;
  targetColumnId: string;
  newIndex: number;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Optimistic move — applies the move instantly to the tasks cache so the UI
 * doesn't lag during DnD. On error the snapshot is restored and the next
 * invalidation brings server-truth.
 */
export function useMoveTask(boardId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ taskId, targetColumnId, newIndex }: MoveTaskVars) => {
      const result = await moveTask(taskId, targetColumnId, newIndex);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },

    onMutate: async ({ taskId, targetColumnId, newIndex }) => {
      await queryClient.cancelQueries({ queryKey: boardKeys.tasks(boardId) });

      const previous = queryClient.getQueryData<TaskWithSubtasks[]>(
        boardKeys.tasks(boardId),
      );

      queryClient.setQueryData<TaskWithSubtasks[]>(
        boardKeys.tasks(boardId),
        (old) => {
          if (!old) return old;

          const taskIndex = old.findIndex((t) => t.id === taskId);
          if (taskIndex === -1) return old;

          const task = old[taskIndex];
          const sourceColumnId = task.columnId;

          if (sourceColumnId === targetColumnId) {
            // Same-column reorder
            const columnTasks = old
              .filter((t) => t.columnId === sourceColumnId)
              .sort((a, b) => a.order - b.order);

            const currentIndex = columnTasks.findIndex((t) => t.id === taskId);
            if (currentIndex === -1) return old;

            const clampedIndex = clamp(
              newIndex,
              0,
              columnTasks.length - 1,
            );
            if (clampedIndex === currentIndex) return old;

            const reordered = [...columnTasks];
            reordered.splice(currentIndex, 1);
            reordered.splice(clampedIndex, 0, task);

            const orderMap = new Map(
              reordered.map((t, i) => [t.id, i]),
            );

            return old.map((t) => {
              const newOrder = orderMap.get(t.id);
              return newOrder !== undefined ? { ...t, order: newOrder } : t;
            });
          }

          // Cross-column move
          const withoutTask = old.filter((t) => t.id !== taskId);

          const targetTasks = withoutTask
            .filter((t) => t.columnId === targetColumnId)
            .sort((a, b) => a.order - b.order);

          const clampedIndex = clamp(newIndex, 0, targetTasks.length);

          const movedTask: TaskWithSubtasks = {
            ...task,
            columnId: targetColumnId,
          };

          const reorderedTarget = [...targetTasks];
          reorderedTarget.splice(clampedIndex, 0, movedTask);

          const orderMap = new Map<string, number>();
          reorderedTarget.forEach((t, i) => orderMap.set(t.id, i));

          // Reorder source column
          const sourceTasks = withoutTask
            .filter((t) => t.columnId === sourceColumnId)
            .sort((a, b) => a.order - b.order);
          sourceTasks.forEach((t, i) => orderMap.set(t.id, i));

          return old.map((t) => {
            if (t.id === taskId) return { ...movedTask, order: orderMap.get(taskId)! };
            const newOrder = orderMap.get(t.id);
            return newOrder !== undefined ? { ...t, order: newOrder } : t;
          });
        },
      );

      return { previous };
    },

    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(boardKeys.tasks(boardId), context.previous);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: boardKeys.tasks(boardId) });
    },
  });
}
