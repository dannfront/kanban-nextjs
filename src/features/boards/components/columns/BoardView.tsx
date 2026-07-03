"use client";

import { useEffect } from "react";
import { ColumnList } from "./ColumnList";
import { useBoardStore } from "@/features/boards/store/useBoardStore";
import { useTaskStore } from "@/features/tasks/store/useTaskStore";
import type { Column } from "@/features/boards/types";
import type { Task } from "@/features/tasks/types";

interface BoardViewProps {
  initialColumns: Column[];
  initialTasks: Task[];
}

export function BoardView({ initialColumns, initialTasks }: BoardViewProps) {
  const setColumns = useBoardStore((state) => state.setColumns);
  const setTasks = useTaskStore((state) => state.setTasks);

  useEffect(() => {
    setColumns(initialColumns);
  }, [initialColumns, setColumns]);

  useEffect(() => {
    setTasks(initialTasks);
  }, [initialTasks, setTasks]);

  return (
    <div className="h-full px-6 py-6">
      <ColumnList />
    </div>
  );
}
