"use client";

import { create } from "zustand";
import type { Task } from "@/features/tasks/types";

interface TaskState {
  tasks: Task[];
  setTasks: (next: Task[]) => void;
}

export const useTaskStore = create<TaskState>((set) => ({
  tasks: [],
  setTasks: (next) => set({ tasks: next }),
}));
