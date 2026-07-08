"use client";

import { create } from "zustand";
import type { Board, Column } from "@/features/boards/types";
import { useTaskStore } from "@/features/tasks/store/useTaskStore";

interface BoardState {
  boards: Board[];
  columns: Column[];
  setBoards: (next: Board[]) => void;
  setColumns: (next: Column[]) => void;
  addBoard: (input: { name: string; columns: { name: string }[] }) => string;
  updateBoard: (
    boardId: string,
    patch: {
      name?: string;
      columns: { id?: string; name: string }[];
    }
  ) => void;
  deleteBoard: (boardId: string) => void;
  deleteColumn: (boardId: string, columnId: string) => void;
}

const DEFAULT_COLUMN_COLOR = "#8471F2";

export const useBoardStore = create<BoardState>((set) => ({
  boards: [],
  columns: [],
  setBoards: (next) => set({ boards: next }),
  setColumns: (next) => set({ columns: next }),

  addBoard: (input) => {
    const boardId = crypto.randomUUID();
    const newBoard: Board = {
      id: boardId,
      name: input.name,
      isActive: true,
    };

    const newColumns: Column[] = input.columns.map((col, index) => ({
      id: crypto.randomUUID(),
      boardId,
      name: col.name,
      color: DEFAULT_COLUMN_COLOR,
      order: index,
    }));

    set((state) => ({
      boards: [...state.boards, newBoard],
      columns: [...state.columns, ...newColumns],
    }));

    return boardId;
  },

  updateBoard: (boardId, patch) =>
    set((state) => {
      const existingColumns = state.columns.filter(
        (c) => c.boardId === boardId
      );

      // Determine which columns to keep, update, or create
      const updatedColumns: Column[] = [];
      const processedIds = new Set<string>();

      for (const col of patch.columns) {
        if (col.id) {
          // Existing column: update name
          const existing = existingColumns.find((c) => c.id === col.id);
          if (existing) {
            updatedColumns.push({
              ...existing,
              name: col.name,
            });
            processedIds.add(col.id);
          }
        } else {
          // New column
          updatedColumns.push({
            id: crypto.randomUUID(),
            boardId,
            name: col.name,
            color: DEFAULT_COLUMN_COLOR,
            order: updatedColumns.length,
          });
        }
      }

      // Reassign order sequentially
      const finalColumns = updatedColumns.map((c, i) => ({
        ...c,
        order: i,
      }));

      // Columns from other boards remain untouched
      const otherColumns = state.columns.filter(
        (c) => c.boardId !== boardId
      );

      // Removed columns = existing columns not in processedIds
      const removedColumnIds = existingColumns
        .filter((c) => !processedIds.has(c.id))
        .map((c) => c.id);

      // If any removed columns had tasks, delete those tasks too
      if (removedColumnIds.length > 0) {
        useTaskStore.getState().deleteTasksForColumns(removedColumnIds);
      }

      return {
        boards: state.boards.map((b) =>
          b.id === boardId ? { ...b, name: patch.name ?? b.name } : b
        ),
        columns: [...otherColumns, ...finalColumns],
      };
    }),

  deleteBoard: (boardId) =>
    set((state) => {
      // Cascade: delete all tasks for this board
      useTaskStore.getState().deleteTasksForBoard(boardId);

      return {
        boards: state.boards.filter((b) => b.id !== boardId),
        columns: state.columns.filter((c) => c.boardId !== boardId),
      };
    }),

  deleteColumn: (boardId, columnId) =>
    set((state) => {
      useTaskStore.getState().deleteTasksForColumn(columnId);
      return {
        columns: state.columns.filter((c) => c.id !== columnId),
      };
    }),
}));
