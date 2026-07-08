"use client";

import { create } from "zustand";
import type { Task } from "@/features/tasks/types";
import { useBoardStore } from "@/features/boards/store/useBoardStore";

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
}

export const useTaskStore = create<TaskState>((set) => ({
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
        .columns.filter((c) => c.boardId === boardId)
        .map((c) => c.id);
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
      tasks: state.tasks.filter((task) => !columnIds.includes(task.columnId)),
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

  moveTask: (taskId, newStatus) =>
    set((state) => {
      const task = state.tasks.find((t) => t.id === taskId);
      if (!task) return state;

      const columns = useBoardStore.getState().columns;
      const currentColumn = columns.find((c) => c.id === task.columnId);
      if (!currentColumn) return state;

      const targetColumn = columns.find(
        (c) => c.boardId === currentColumn.boardId && c.name === newStatus
      );
      if (!targetColumn || targetColumn.id === task.columnId) return state;

      return {
        tasks: state.tasks.map((t) =>
          t.id === taskId
            ? { ...task, status: newStatus, columnId: targetColumn.id }
            : t
        ),
      };
    }),
}));
