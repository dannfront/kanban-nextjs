"use client";

import { create } from "zustand";

import { useBoardStore } from "@/features/boards/store/useBoardStore";
import type { Task } from "@/features/tasks/types";

interface ReorderTaskInput {
  taskId: string;
  sourceColumnId: string;
  targetColumnId: string;
  newIndex: number;
}

interface ReorderTasksInColumnInput {
  columnId: string;
  orderedTaskIds: string[];
}

interface TaskState {
  tasks: Task[];
  setTasks: (next: Task[]) => void;
  addTask: (task: Omit<Task, "id">) => string;
  updateTask: (taskId: string, updates: Partial<Omit<Task, "id">>) => void;
  deleteTask: (taskId: string) => void;
  deleteTasksForBoard: (boardId: string) => void;
  deleteTasksForColumn: (columnId: string) => void;
  deleteTasksForColumns: (columnIds: string[]) => void;
  toggleSubtask: (args: { taskId: string; subtaskId: string }) => void;
  moveTask: (taskId: string, newStatus: string) => void;
  reorderTask: (input: ReorderTaskInput) => void;
  reorderTasksInColumn: (input: ReorderTasksInColumnInput) => void;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function tasksInColumnSorted(tasks: Task[], columnId: string): Task[] {
  return tasks
    .filter((task) => task.columnId === columnId)
    .sort((a, b) => a.order - b.order);
}

function applyOrderToTasks(
  tasks: Task[],
  columnId: string,
  orderedIds: string[]
): Task[] {
  const orderMap = new Map(orderedIds.map((id, index) => [id, index]));

  return tasks.map((task) => {
    if (task.columnId !== columnId) return task;

    const order = orderMap.get(task.id);
    return order !== undefined ? { ...task, order } : task;
  });
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  setTasks: (next) => set({ tasks: next }),

  addTask: (task) => {
    const id = crypto.randomUUID();
    set((state) => ({ tasks: [...state.tasks, { ...task, id }] }));
    return id;
  },

  updateTask: (taskId, updates) =>
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === taskId ? { ...task, ...updates } : task
      ),
    })),

  deleteTask: (taskId) =>
    set((state) => ({
      tasks: state.tasks.filter((task) => task.id !== taskId),
    })),

  deleteTasksForBoard: (boardId) =>
    set((state) => {
      const boardColumns = useBoardStore
        .getState()
        .columns.filter((column) => column.boardId === boardId)
        .map((column) => column.id);

      return {
        tasks: state.tasks.filter(
          (task) => !boardColumns.includes(task.columnId)
        ),
      };
    }),

  deleteTasksForColumn: (columnId) =>
    set((state) => ({
      tasks: state.tasks.filter((task) => task.columnId !== columnId),
    })),

  deleteTasksForColumns: (columnIds) =>
    set((state) => ({
      tasks: state.tasks.filter(
        (task) => !columnIds.includes(task.columnId)
      ),
    })),

  toggleSubtask: ({ taskId, subtaskId }) =>
    set((state) => ({
      tasks: state.tasks.map((task) => {
        if (task.id !== taskId) return task;

        return {
          ...task,
          subtasks: task.subtasks.map((subtask) =>
            subtask.id === subtaskId
              ? { ...subtask, isCompleted: !subtask.isCompleted }
              : subtask
          ),
        };
      }),
    })),

  reorderTask: ({ taskId, sourceColumnId, targetColumnId, newIndex }) =>
    set((state) => {
      const task = state.tasks.find((item) => item.id === taskId);
      if (!task || task.columnId !== sourceColumnId) return state;

      if (sourceColumnId === targetColumnId) {
        const columnTasks = tasksInColumnSorted(state.tasks, sourceColumnId);
        const currentIndex = columnTasks.findIndex((item) => item.id === taskId);
        if (currentIndex === -1) return state;

        const clampedIndex = clamp(newIndex, 0, columnTasks.length - 1);
        if (clampedIndex === currentIndex) return state;

        const reordered = [...columnTasks];
        const [moved] = reordered.splice(currentIndex, 1);
        reordered.splice(clampedIndex, 0, moved);

        return {
          tasks: applyOrderToTasks(
            state.tasks,
            sourceColumnId,
            reordered.map((item) => item.id)
          ),
        };
      }

      const targetColumn = useBoardStore
        .getState()
        .columns.find((column) => column.id === targetColumnId);
      if (!targetColumn) return state;

      const withoutMoved = state.tasks.filter((item) => item.id !== taskId);
      const targetTasks = tasksInColumnSorted(withoutMoved, targetColumnId);
      const clampedIndex = clamp(newIndex, 0, targetTasks.length);

      const movedTask: Task = {
        ...task,
        columnId: targetColumnId,
        status: targetColumn.name,
        order: clampedIndex,
      };
      targetTasks.splice(clampedIndex, 0, movedTask);

      const orderUpdates = new Map<string, number>();
      tasksInColumnSorted(withoutMoved, sourceColumnId).forEach(
        (item, index) => {
          orderUpdates.set(item.id, index);
        }
      );
      targetTasks.forEach((item, index) => {
        orderUpdates.set(item.id, index);
      });

      return {
        tasks: state.tasks.map((item) => {
          if (item.id === taskId) return movedTask;

          const order = orderUpdates.get(item.id);
          return order !== undefined ? { ...item, order } : item;
        }),
      };
    }),

  reorderTasksInColumn: ({ columnId, orderedTaskIds }) =>
    set((state) => ({
      tasks: applyOrderToTasks(state.tasks, columnId, orderedTaskIds),
    })),

  moveTask: (taskId, newStatus) => {
    const task = get().tasks.find((item) => item.id === taskId);
    if (!task) return;

    const columns = useBoardStore.getState().columns;
    const currentColumn = columns.find((column) => column.id === task.columnId);
    if (!currentColumn) return;

    const targetColumn = columns.find(
      (column) =>
        column.boardId === currentColumn.boardId && column.name === newStatus
    );
    if (!targetColumn || targetColumn.id === task.columnId) return;

    const targetIndex = get().tasks.filter(
      (item) => item.columnId === targetColumn.id
    ).length;

    get().reorderTask({
      taskId,
      sourceColumnId: currentColumn.id,
      targetColumnId: targetColumn.id,
      newIndex: targetIndex,
    });
  },
}));
