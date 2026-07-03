"use client";

import { create } from "zustand";
import type { Task } from "@/features/tasks/types";
import { useBoardStore } from "@/features/boards/store/useBoardStore";

interface TaskState {
  tasks: Task[];
  setTasks: (next: Task[]) => void;
  toggleSubtask: (args: { taskId: string; subtaskId: string }) => void;
  moveTask: (taskId: string, newStatus: string) => void;
}

export const useTaskStore = create<TaskState>((set) => ({
  tasks: [],
  setTasks: (next) => set({ tasks: next }),

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
